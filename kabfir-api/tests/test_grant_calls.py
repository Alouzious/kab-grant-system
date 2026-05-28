import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.models import GrantCall, GrantCallStatus


SAMPLE_CALL = {
    "title": "KAB-FIR 2026 Research Grant Call",
    "description": "Annual research funding round for Kabale University staff.",
    "grant_type": "Research",
    "academic_year": 2026,
    "opening_date": "2026-01-01",
    "closing_date": "2026-06-30",
    "max_budget": "20000000.00",
}


class TestGrantCallCreate:

    async def test_admin_can_create_grant_call(self, client, admin_token):
        resp = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                 headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == SAMPLE_CALL["title"]
        assert data["status"] == "Draft"
        assert data["grant_type"] == "Research"

    async def test_sgo_admin_can_create_grant_call(self, client, sgo_token):
        payload = {**SAMPLE_CALL, "title": "SGO Created Call"}
        resp = await client.post("/api/v1/admin/grant-calls", json=payload,
                                 headers={"Authorization": f"Bearer {sgo_token}"})
        assert resp.status_code == 201
        assert resp.json()["status"] == "Draft"

    async def test_staff_cannot_create_grant_call(self, client, staff_token):
        resp = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                 headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 403

    async def test_reviewer_cannot_create_grant_call(self, client, reviewer_token, reviewer_user):
        resp = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                 headers={"Authorization": f"Bearer {reviewer_token}"})
        assert resp.status_code == 403

    async def test_closing_date_must_be_after_opening(self, client, admin_token):
        payload = {**SAMPLE_CALL, "opening_date": "2026-06-30", "closing_date": "2026-01-01"}
        resp = await client.post("/api/v1/admin/grant-calls", json=payload,
                                 headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 422

    async def test_unauthenticated_cannot_create(self, client):
        resp = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL)
        assert resp.status_code == 403


class TestGrantCallList:

    async def test_admin_sees_all_statuses(self, client, admin_token, db):
        # Create one draft call
        await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                          headers={"Authorization": f"Bearer {admin_token}"})
        resp = await client.get("/api/v1/admin/grant-calls",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_staff_only_sees_open_calls(self, client, admin_token, staff_token, staff_user):
        # Create a draft call (not visible to staff)
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]

        # Staff should see empty list
        resp = await client.get("/api/v1/admin/grant-calls",
                                headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 200
        assert all(c["status"] == "Open" for c in resp.json())

        # Open the call — staff should now see it
        await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                          headers={"Authorization": f"Bearer {admin_token}"})
        resp2 = await client.get("/api/v1/admin/grant-calls",
                                 headers={"Authorization": f"Bearer {staff_token}"})
        assert any(c["id"] == call_id for c in resp2.json())

    async def test_sgo_admin_sees_all_statuses(self, client, sgo_token, admin_token):
        await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                          headers={"Authorization": f"Bearer {admin_token}"})
        resp = await client.get("/api/v1/admin/grant-calls",
                                headers={"Authorization": f"Bearer {sgo_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1


class TestGrantCallGet:

    async def test_get_single_call(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]
        resp = await client.get(f"/api/v1/admin/grant-calls/{call_id}",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["id"] == call_id

    async def test_get_nonexistent_call(self, client, admin_token):
        resp = await client.get("/api/v1/admin/grant-calls/99999",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 404


class TestGrantCallUpdate:

    async def test_update_draft_call(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]

        resp = await client.put(
            f"/api/v1/admin/grant-calls/{call_id}",
            json={"title": "Updated Grant Call Title"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Grant Call Title"

    async def test_cannot_update_closed_call(self, client, admin_token, db):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]

        # Open then close
        await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                          headers={"Authorization": f"Bearer {admin_token}"})
        await client.post(f"/api/v1/admin/grant-calls/{call_id}/close-window",
                          headers={"Authorization": f"Bearer {admin_token}"})

        resp = await client.put(
            f"/api/v1/admin/grant-calls/{call_id}",
            json={"title": "Should Fail"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 400


class TestGrantCallWindowManagement:

    async def test_open_window(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]

        resp = await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                                 headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "Open"

    async def test_cannot_open_already_open(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]
        await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                          headers={"Authorization": f"Bearer {admin_token}"})

        resp = await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                                 headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 400

    async def test_close_window(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]
        await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                          headers={"Authorization": f"Bearer {admin_token}"})

        resp = await client.post(f"/api/v1/admin/grant-calls/{call_id}/close-window",
                                 headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "Closed"

    async def test_cannot_close_draft(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]
        resp = await client.post(f"/api/v1/admin/grant-calls/{call_id}/close-window",
                                 headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 400

    async def test_cannot_reopen_closed_call(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]
        await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                          headers={"Authorization": f"Bearer {admin_token}"})
        await client.post(f"/api/v1/admin/grant-calls/{call_id}/close-window",
                          headers={"Authorization": f"Bearer {admin_token}"})

        resp = await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                                 headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 400

    async def test_sgo_admin_can_manage_window(self, client, sgo_token, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]

        resp = await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                                 headers={"Authorization": f"Bearer {sgo_token}"})
        assert resp.status_code == 200


class TestGrantCallDelete:

    async def test_delete_draft_call(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]

        resp = await client.delete(f"/api/v1/admin/grant-calls/{call_id}",
                                   headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200

        get = await client.get(f"/api/v1/admin/grant-calls/{call_id}",
                               headers={"Authorization": f"Bearer {admin_token}"})
        assert get.status_code == 404

    async def test_cannot_delete_open_call(self, client, admin_token):
        create = await client.post("/api/v1/admin/grant-calls", json=SAMPLE_CALL,
                                   headers={"Authorization": f"Bearer {admin_token}"})
        call_id = create.json()["id"]
        await client.post(f"/api/v1/admin/grant-calls/{call_id}/open-window",
                          headers={"Authorization": f"Bearer {admin_token}"})

        resp = await client.delete(f"/api/v1/admin/grant-calls/{call_id}",
                                   headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 400
