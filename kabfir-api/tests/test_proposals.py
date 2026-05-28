import pytest
import io
from httpx import AsyncClient
from app.models.models import Proposal, ProposalStatus


SAMPLE_PROPOSAL = {
    "grant_type": "Research",
    "pi_first_name": "Alice", "pi_last_name": "Nakato",
    "pi_qualification": "PhD", "pi_gender": "Female",
    "pi_designation": "Lecturer", "pi_department": "Computer Science",
    "pi_research_specialization": "Machine Learning",
    "pi_email": "alice@kab.ac.ug", "pi_phone": "+256700000000",
    "research_type": "Applied Research",
    "title": "AI-Based Malaria Detection in Rural Uganda",
    "project_summary": "This project explores AI methods for malaria detection.",
    "problem_statement": "Malaria remains a major health challenge.",
    "proposed_solution": "Use ML models on blood sample images.",
    "relevance": "Directly relevant to Uganda health goals.",
    "innovativeness": "Novel use of deep learning in low-resource settings.",
    "main_objective": "Develop an accurate malaria detection model.",
    "specific_objectives": "1. Collect data. 2. Train model. 3. Validate.",
    "methods_description": "Mixed methods including lab analysis and ML.",
    "outcomes": "A working prototype and published paper.",
    "dissemination_plan": "Journal publications and community workshops.",
    "policy_impact": "Inform national health policy on diagnostics.",
    "scalability": "Can be scaled to other diseases.",
    "sustainability": "Open-source tools used throughout.",
    "gender_considerations": "Equal participation across genders.",
    "ethical_impact": "Ethical clearance will be obtained.",
    "capacity_building": "Train 5 research assistants.",
    "conflict_of_interest": "None declared.",
    "references": "1. Smith et al., 2021.",
    "total_budget": "15000000.00",
    "pi_faculty_id": None,  # filled in tests
}


class TestCreateProposal:

    async def test_create_draft_success(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        resp = await client.post(
            "/api/v1/proposals",
            json=payload,
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "Draft"
        assert data["grant_type"] == "Research"
        assert "PR2026/PROPOSAL/" in data["protocol_no"]
        assert data["title"] == payload["title"]

    async def test_create_innovation_proposal(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id,
                   "grant_type": "Innovation", "title": "AgriTech Innovation Platform"}
        resp = await client.post(
            "/api/v1/proposals", json=payload,
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["grant_type"] == "Innovation"

    async def test_create_proposal_requires_auth(self, client, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        resp = await client.post("/api/v1/proposals", json=payload)
        assert resp.status_code == 403

    async def test_reviewer_cannot_create_proposal(self, client, reviewer_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        resp = await client.post(
            "/api/v1/proposals", json=payload,
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        assert resp.status_code == 403

    async def test_duplicate_title_same_year_blocked(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        await client.post("/api/v1/proposals", json=payload,
                          headers={"Authorization": f"Bearer {staff_token}"})
        resp = await client.post("/api/v1/proposals", json=payload,
                                 headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 400
        assert "already submitted" in resp.json()["detail"]

    async def test_submission_blocked_after_deadline(self, client, staff_token, seed_faculty, db, seed_settings, monkeypatch):
        from datetime import date
        monkeypatch.setattr("app.utils.helpers.is_submission_open", lambda: (False, "The submission deadline has passed."))
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id, "title": "Late Submission"}
        resp = await client.post("/api/v1/proposals", json=payload,
                                 headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 403
        assert "deadline" in resp.json()["detail"].lower()


class TestGetProposals:

    async def test_get_my_proposals(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        await client.post("/api/v1/proposals", json=payload,
                          headers={"Authorization": f"Bearer {staff_token}"})
        resp = await client.get("/api/v1/proposals/my",
                                headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    async def test_get_proposal_detail(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        create = await client.post("/api/v1/proposals", json=payload,
                                   headers={"Authorization": f"Bearer {staff_token}"})
        pid = create.json()["id"]
        resp = await client.get(f"/api/v1/proposals/{pid}",
                                headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 200
        assert resp.json()["id"] == pid

    async def test_staff_cannot_view_other_proposals(self, client, db, seed_faculty, seed_settings, admin_user):
        # Create a second staff user and their proposal
        from app.models.models import User, UserRole, Gender
        from app.utils.password import hash_password
        user2 = User(
            first_name="Bob", surname="Opio", gender=Gender.male,
            email="bob.opio@kab.ac.ug", password_hash=hash_password("pass1234"),
            role=UserRole.staff, is_active=True,
        )
        db.add(user2)
        await db.commit()

        login2 = await client.post("/api/v1/auth/login", json={"email": "bob.opio@kab.ac.ug", "password": "pass1234"})
        token2 = login2.json()["access_token"]

        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id, "title": "Bob's Private Proposal"}
        create = await client.post("/api/v1/proposals", json=payload,
                                   headers={"Authorization": f"Bearer {token2}"})
        pid = create.json()["id"]

        # staff_token belongs to alice — she should not see bob's proposal
        login1 = await client.post("/api/v1/auth/login", json={"email": "alice@kab.ac.ug", "password": "password123"})

    async def test_proposal_not_found(self, client, staff_token):
        resp = await client.get("/api/v1/proposals/99999",
                                headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 404


class TestUpdateProposal:

    async def test_update_draft_success(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        create = await client.post("/api/v1/proposals", json=payload,
                                   headers={"Authorization": f"Bearer {staff_token}"})
        pid = create.json()["id"]
        resp = await client.patch(
            f"/api/v1/proposals/{pid}",
            json={"title": "Updated Title for Testing"},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Title for Testing"

    async def test_cannot_update_submitted_proposal(self, client, staff_token, seed_faculty, seed_settings, db):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        create = await client.post("/api/v1/proposals", json=payload,
                                   headers={"Authorization": f"Bearer {staff_token}"})
        pid = create.json()["id"]

        # Force status to submitted
        from sqlalchemy import select
        from app.core.database import Base
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.submitted
        await db.commit()

        resp = await client.patch(
            f"/api/v1/proposals/{pid}",
            json={"title": "Should Not Update"},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 400


class TestDeleteProposal:

    async def test_delete_draft(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        create = await client.post("/api/v1/proposals", json=payload,
                                   headers={"Authorization": f"Bearer {staff_token}"})
        pid = create.json()["id"]
        resp = await client.delete(f"/api/v1/proposals/{pid}",
                                   headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 200
        # Confirm gone
        get = await client.get(f"/api/v1/proposals/{pid}",
                               headers={"Authorization": f"Bearer {staff_token}"})
        assert get.status_code == 404


class TestAttachments:

    async def _create_proposal(self, client, staff_token, seed_faculty):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        return r.json()["id"]

    async def test_upload_attachment_success(self, client, staff_token, seed_faculty, seed_settings):
        pid = await self._create_proposal(client, staff_token, seed_faculty)
        file_content = b"%PDF fake content"
        resp = await client.post(
            f"/api/v1/proposals/{pid}/attachments",
            data={"attachment_type": "Budget"},
            files={"file": ("budget.pdf", io.BytesIO(file_content), "application/pdf")},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["attachment_type"] == "Budget"

    async def test_upload_replaces_existing_same_type(self, client, staff_token, seed_faculty, seed_settings):
        pid = await self._create_proposal(client, staff_token, seed_faculty)
        for name in ["budget_v1.pdf", "budget_v2.pdf"]:
            await client.post(
                f"/api/v1/proposals/{pid}/attachments",
                data={"attachment_type": "Budget"},
                files={"file": (name, io.BytesIO(b"%PDF content"), "application/pdf")},
                headers={"Authorization": f"Bearer {staff_token}"}
            )
        # Get proposal and check only one Budget attachment
        detail = await client.get(f"/api/v1/proposals/{pid}",
                                  headers={"Authorization": f"Bearer {staff_token}"})
        budgets = [a for a in detail.json()["attachments"] if a["attachment_type"] == "Budget"]
        assert len(budgets) == 1


class TestTeamMembers:

    async def test_add_team_member(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        create = await client.post("/api/v1/proposals", json=payload,
                                   headers={"Authorization": f"Bearer {staff_token}"})
        pid = create.json()["id"]

        resp = await client.post(
            f"/api/v1/proposals/{pid}/team-members",
            json={
                "first_name": "James", "last_name": "Tumwine",
                "qualification": "MSc", "gender": "Male",
                "designation": "Research Assistant",
                "email": "james@kab.ac.ug", "phone": "+256700000001",
            },
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["first_name"] == "James"

    async def test_remove_team_member(self, client, staff_token, seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        create = await client.post("/api/v1/proposals", json=payload,
                                   headers={"Authorization": f"Bearer {staff_token}"})
        pid = create.json()["id"]

        add = await client.post(
            f"/api/v1/proposals/{pid}/team-members",
            json={"first_name": "Jane", "last_name": "Amoit", "qualification": "BSc",
                  "gender": "Female", "designation": "Assistant", "email": "jane@kab.ac.ug"},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        mid = add.json()["id"]

        resp = await client.delete(f"/api/v1/proposals/{pid}/team-members/{mid}",
                                   headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 200
