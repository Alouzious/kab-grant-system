import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.models import Proposal, ProposalStatus


SAMPLE_PROPOSAL = {
    "grant_type": "Research", "pi_first_name": "Alice", "pi_last_name": "Nakato",
    "pi_qualification": "PhD", "pi_gender": "Female", "pi_designation": "Lecturer",
    "pi_department": "CS", "pi_research_specialization": "ML",
    "pi_email": "alice@kab.ac.ug", "pi_phone": "+256700000000",
    "research_type": "Applied", "title": "SGO Test Proposal",
    "project_summary": "Summary", "problem_statement": "Problem",
    "proposed_solution": "Solution", "relevance": "Relevant",
    "innovativeness": "Innovative", "main_objective": "Objective",
    "specific_objectives": "1. Do this", "methods_description": "Methods",
    "outcomes": "Outcomes", "dissemination_plan": "Disseminate",
    "policy_impact": "Policy", "scalability": "Scalable",
    "sustainability": "Sustainable", "gender_considerations": "Gender",
    "ethical_impact": "Ethical", "capacity_building": "Capacity",
    "conflict_of_interest": "None", "references": "Ref 1",
    "total_budget": "10000000.00", "pi_faculty_id": None,
}


class TestSGOAdminRole:
    """Verify sgo_admin has the same admin-level access as admin across all modules."""

    async def test_sgo_login_returns_correct_role(self, client, sgo_admin_user):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "sgo@kab.ac.ug", "password": "sgopass123"
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "sgo_admin"

    async def test_sgo_can_access_dashboard(self, client, sgo_token):
        resp = await client.get("/api/v1/admin/dashboard",
                                headers={"Authorization": f"Bearer {sgo_token}"})
        assert resp.status_code == 200

    async def test_sgo_can_list_users(self, client, sgo_token, staff_user):
        resp = await client.get("/api/v1/admin/users",
                                headers={"Authorization": f"Bearer {sgo_token}"})
        assert resp.status_code == 200

    async def test_sgo_can_create_reviewer(self, client, sgo_token):
        resp = await client.post("/api/v1/admin/reviewers", json={
            "first_name": "SGO", "surname": "Reviewer",
            "gender": "Male", "email": "sgo.reviewer@gmail.com",
            "password": "reviewpass123", "confirm_password": "reviewpass123",
        }, headers={"Authorization": f"Bearer {sgo_token}"})
        assert resp.status_code == 201

    async def test_sgo_can_list_submitted_proposals(self, client, sgo_token, admin_token,
                                                     staff_token, staff_user, seed_faculty,
                                                     seed_settings, db):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]
        from datetime import datetime, timezone
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.submitted
        p.submitted_at = datetime.now(timezone.utc)
        await db.commit()

        resp = await client.get("/api/v1/admin/proposals/submitted",
                                headers={"Authorization": f"Bearer {sgo_token}"})
        assert resp.status_code == 200

    async def test_sgo_can_assign_reviewers(self, client, sgo_token, admin_token,
                                             staff_token, staff_user, seed_faculty,
                                             seed_settings, reviewer_user, db):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]
        from datetime import datetime, timezone
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.submitted
        p.submitted_at = datetime.now(timezone.utc)
        await db.commit()

        _, reviewer = reviewer_user
        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/assign-reviewers",
            json={"reviewer_ids": [reviewer.id]},
            headers={"Authorization": f"Bearer {sgo_token}"}
        )
        assert resp.status_code == 200

    async def test_sgo_can_make_final_decision(self, client, sgo_token, staff_token,
                                                staff_user, seed_faculty, seed_settings, db):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.reviewed
        await db.commit()

        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/decision",
            json={"decision": "Approved", "note": "Approved by SGO."},
            headers={"Authorization": f"Bearer {sgo_token}"}
        )
        assert resp.status_code == 200

    async def test_sgo_can_update_system_settings(self, client, sgo_token, seed_settings):
        resp = await client.patch(
            "/api/v1/general/settings",
            json={"system_name": "Updated by SGO"},
            headers={"Authorization": f"Bearer {sgo_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["system_name"] == "Updated by SGO"

    async def test_sgo_cannot_access_reviewer_routes(self, client, sgo_token):
        resp = await client.get("/api/v1/reviewer/proposals",
                                headers={"Authorization": f"Bearer {sgo_token}"})
        assert resp.status_code == 403


class TestScoreField:
    """Verify score is accepted in review submissions."""

    async def _setup_assigned_proposal(self, client, db, staff_token, admin_token,
                                        seed_faculty, reviewer_user):
        from datetime import datetime, timezone
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id,
                   "title": "Score Test Proposal"}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.submitted
        p.submitted_at = datetime.now(timezone.utc)
        await db.commit()
        _, reviewer = reviewer_user
        await client.post(
            f"/api/v1/admin/proposals/{pid}/assign-reviewers",
            json={"reviewer_ids": [reviewer.id]},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        return pid

    async def test_submit_review_with_score(self, client, db, staff_token, admin_token,
                                             reviewer_token, staff_user, seed_faculty,
                                             seed_settings, reviewer_user):
        pid = await self._setup_assigned_proposal(client, db, staff_token, admin_token,
                                                   seed_faculty, reviewer_user)
        resp = await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Approve", "score": "8", "comments": "Excellent work."},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["score"] == 8

    async def test_submit_review_without_score(self, client, db, staff_token, admin_token,
                                                reviewer_token, staff_user, seed_faculty,
                                                seed_settings, reviewer_user):
        pid = await self._setup_assigned_proposal(client, db, staff_token, admin_token,
                                                   seed_faculty, reviewer_user)
        resp = await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Minor Revisions"},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["score"] is None

    async def test_score_out_of_range_rejected(self, client, db, staff_token, admin_token,
                                                reviewer_token, staff_user, seed_faculty,
                                                seed_settings, reviewer_user):
        pid = await self._setup_assigned_proposal(client, db, staff_token, admin_token,
                                                   seed_faculty, reviewer_user)
        for bad_score in ["0", "11", "99"]:
            resp = await client.post(
                f"/api/v1/reviewer/proposals/{pid}/review",
                data={"recommendation": "Approve", "score": bad_score},
                headers={"Authorization": f"Bearer {reviewer_token}"}
            )
            assert resp.status_code == 400, f"Expected 400 for score={bad_score}"


class TestReviewDeadline:
    """Verify admin can set per-reviewer deadlines."""

    async def _setup_assigned(self, client, db, staff_token, admin_token,
                               seed_faculty, reviewer_user):
        from datetime import datetime, timezone
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id,
                   "title": "Deadline Test Proposal"}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.submitted
        p.submitted_at = datetime.now(timezone.utc)
        await db.commit()
        _, reviewer = reviewer_user
        await client.post(
            f"/api/v1/admin/proposals/{pid}/assign-reviewers",
            json={"reviewer_ids": [reviewer.id]},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        return pid, reviewer.id

    async def test_set_review_deadline(self, client, db, staff_token, admin_token,
                                        staff_user, seed_faculty, seed_settings, reviewer_user):
        pid, reviewer_id = await self._setup_assigned(client, db, staff_token, admin_token,
                                                       seed_faculty, reviewer_user)
        resp = await client.patch(
            f"/api/v1/admin/proposals/{pid}/reviewers/{reviewer_id}/deadline",
            json={"deadline": "2026-07-15"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assert "2026-07-15" in resp.json()["message"]

    async def test_set_deadline_nonexistent_assignment(self, client, admin_token):
        resp = await client.patch(
            "/api/v1/admin/proposals/99999/reviewers/99999/deadline",
            json={"deadline": "2026-07-15"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 404

    async def test_get_review_status(self, client, db, staff_token, admin_token,
                                      staff_user, seed_faculty, seed_settings, reviewer_user):
        pid, _ = await self._setup_assigned(client, db, staff_token, admin_token,
                                             seed_faculty, reviewer_user)
        resp = await client.get(
            f"/api/v1/admin/proposals/{pid}/review-status",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assignments = resp.json()
        assert len(assignments) == 1
        assert assignments[0]["review_status"] == "Pending"
