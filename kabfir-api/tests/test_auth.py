import pytest
from httpx import AsyncClient


class TestRegistration:

    async def test_register_success(self, client, seed_faculty, seed_department):
        resp = await client.post("/api/v1/auth/register", json={
            "first_name": "John", "surname": "Doe", "gender": "Male",
            "email": "john.doe@kab.ac.ug", "password": "securepass123",
            "confirm_password": "securepass123",
            "faculty_id": seed_faculty.id, "department_id": seed_department.id,
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "john.doe@kab.ac.ug"
        assert data["role"] == "staff"
        assert "password_hash" not in data

    async def test_register_rejects_non_kab_email(self, client, seed_faculty, seed_department):
        resp = await client.post("/api/v1/auth/register", json={
            "first_name": "Jane", "surname": "Doe", "gender": "Female",
            "email": "jane.doe@gmail.com", "password": "securepass123",
            "confirm_password": "securepass123",
            "faculty_id": seed_faculty.id, "department_id": seed_department.id,
        })
        assert resp.status_code == 422
        assert "kab.ac.ug" in resp.text

    async def test_register_rejects_short_password(self, client, seed_faculty, seed_department):
        resp = await client.post("/api/v1/auth/register", json={
            "first_name": "John", "surname": "Doe", "gender": "Male",
            "email": "john2@kab.ac.ug", "password": "short",
            "confirm_password": "short",
            "faculty_id": seed_faculty.id, "department_id": seed_department.id,
        })
        assert resp.status_code == 422

    async def test_register_rejects_mismatched_passwords(self, client, seed_faculty, seed_department):
        resp = await client.post("/api/v1/auth/register", json={
            "first_name": "John", "surname": "Doe", "gender": "Male",
            "email": "john3@kab.ac.ug", "password": "securepass123",
            "confirm_password": "differentpass",
            "faculty_id": seed_faculty.id, "department_id": seed_department.id,
        })
        assert resp.status_code == 422

    async def test_register_duplicate_email(self, client, staff_user, seed_faculty, seed_department):
        resp = await client.post("/api/v1/auth/register", json={
            "first_name": "Alice", "surname": "Again", "gender": "Female",
            "email": "alice@kab.ac.ug",
            "password": "securepass123", "confirm_password": "securepass123",
            "faculty_id": seed_faculty.id, "department_id": seed_department.id,
        })
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"]


class TestLogin:

    async def test_login_success(self, client, staff_user):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "alice@kab.ac.ug", "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["role"] == "staff"
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client, staff_user):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "alice@kab.ac.ug", "password": "wrongpassword",
        })
        assert resp.status_code == 401

    async def test_login_nonexistent_email(self, client):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "nobody@kab.ac.ug", "password": "password123",
        })
        assert resp.status_code == 401

    async def test_login_deactivated_account(self, client, db, staff_user):
        staff_user.is_active = False
        await db.commit()
        resp = await client.post("/api/v1/auth/login", json={
            "email": "alice@kab.ac.ug", "password": "password123",
        })
        assert resp.status_code == 403
        assert "deactivated" in resp.json()["detail"]

    async def test_admin_login_returns_admin_role(self, client, admin_user):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "admin@kab.ac.ug", "password": "adminpass123",
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "admin"

    async def test_reviewer_login_returns_reviewer_role(self, client, reviewer_user):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "bob.mugisha@gmail.com", "password": "reviewpass123",
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "reviewer"


class TestTokenRefresh:

    async def test_refresh_token_success(self, client, staff_user):
        login = await client.post("/api/v1/auth/login", json={
            "email": "alice@kab.ac.ug", "password": "password123"
        })
        refresh_token = login.json()["refresh_token"]
        resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    async def test_refresh_with_invalid_token(self, client):
        resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": "not.a.real.token"})
        assert resp.status_code == 401

    async def test_refresh_with_access_token_fails(self, client, staff_token):
        resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": staff_token})
        assert resp.status_code == 401


class TestGetMe:

    async def test_get_me_authenticated(self, client, staff_token):
        resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 200
        assert resp.json()["email"] == "alice@kab.ac.ug"

    async def test_get_me_unauthenticated(self, client):
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code == 403


class TestPasswordFlows:

    async def test_change_password_success(self, client, staff_token):
        resp = await client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "password123", "new_password": "newpassword456", "confirm_password": "newpassword456"},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 200
        assert "changed successfully" in resp.json()["message"]

    async def test_change_password_wrong_current(self, client, staff_token):
        resp = await client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "wrongcurrent", "new_password": "newpassword456", "confirm_password": "newpassword456"},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 400

    async def test_forgot_password_always_returns_success(self, client):
        for email in ["alice@kab.ac.ug", "nonexistent@kab.ac.ug"]:
            resp = await client.post("/api/v1/auth/forgot-password", json={"email": email})
            assert resp.status_code == 200


class TestSGOAdminLogin:

    async def test_sgo_admin_login_returns_correct_role(self, client, sgo_admin_user):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "sgo@kab.ac.ug", "password": "sgopass123"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["role"] == "sgo_admin"
        assert "access_token" in data
        assert "refresh_token" in data
