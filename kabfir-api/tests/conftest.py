import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from unittest.mock import AsyncMock

from app.main import app
from app.core.database import Base, get_db
from app.models.models import (
    User, UserRole, Faculty, Department, Reviewer,
    SystemSetting, Gender
)
from app.utils.password import hash_password
from datetime import date

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_tables():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db():
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()
        for table in reversed(Base.metadata.sorted_tables):
            await session.execute(table.delete())
        await session.commit()


@pytest_asyncio.fixture
async def client(db):
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seed_faculty(db):
    faculty = Faculty(name="Faculty of Computing and Informatics")
    db.add(faculty)
    await db.commit()
    await db.refresh(faculty)
    return faculty


@pytest_asyncio.fixture
async def seed_department(db, seed_faculty):
    dept = Department(name="Computer Science", faculty_id=seed_faculty.id)
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept


@pytest_asyncio.fixture
async def seed_settings(db):
    s = SystemSetting(
        system_name="KAB-FIR Test",
        active_academic_year=2026,
        submission_deadline=date(2026, 12, 31),
        is_accepting_applications=True,
    )
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s


@pytest_asyncio.fixture
async def staff_user(db, seed_faculty, seed_department):
    user = User(
        first_name="Alice", surname="Nakato", gender=Gender.female,
        email="alice@kab.ac.ug", password_hash=hash_password("password123"),
        role=UserRole.staff, faculty_id=seed_faculty.id,
        department_id=seed_department.id, is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_user(db):
    user = User(
        first_name="Admin", surname="SGO", gender=Gender.male,
        email="admin@kab.ac.ug", password_hash=hash_password("adminpass123"),
        role=UserRole.admin, is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture
async def reviewer_user(db, admin_user):
    user = User(
        first_name="Bob", surname="Mugisha", gender=Gender.male,
        email="bob.mugisha@gmail.com", password_hash=hash_password("reviewpass123"),
        role=UserRole.reviewer, is_active=True, must_change_password=False,
    )
    db.add(user)
    await db.commit()
    reviewer = Reviewer(
        user_id=user.id, research_discipline="Computer Science",
        assigned_by=admin_user.id,
    )
    db.add(reviewer)
    await db.commit()
    await db.refresh(user)
    await db.refresh(reviewer)
    return user, reviewer


@pytest_asyncio.fixture
async def staff_token(client, staff_user):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "alice@kab.ac.ug", "password": "password123"
    })
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def admin_token(client, admin_user):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@kab.ac.ug", "password": "adminpass123"
    })
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def reviewer_token(client, reviewer_user):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "bob.mugisha@gmail.com", "password": "reviewpass123"
    })
    return resp.json()["access_token"]


@pytest.fixture(autouse=True)
def mock_email(monkeypatch):
    monkeypatch.setattr("app.utils.email.send_email", AsyncMock(return_value=True))
    monkeypatch.setattr("app.utils.email.send_otp_email", AsyncMock(return_value=True))
    monkeypatch.setattr("app.utils.email.send_proposal_submitted_email", AsyncMock(return_value=True))
    monkeypatch.setattr("app.utils.email.send_reviewer_assignment_email", AsyncMock(return_value=True))
    monkeypatch.setattr("app.utils.email.send_proposal_decision_email", AsyncMock(return_value=True))


@pytest.fixture(autouse=True)
def mock_cloudinary(monkeypatch):
    async def fake_upload(file, folder=""):
        return {
            "url": "https://res.cloudinary.com/test/raw/upload/fake.pdf",
            "public_id": "kabfir/test/fake",
            "file_name": getattr(file, "filename", "test.pdf") or "test.pdf",
        }
    monkeypatch.setattr("app.utils.cloudinary.upload_file", fake_upload)
    monkeypatch.setattr("app.utils.cloudinary.delete_file", AsyncMock(return_value=True))

@pytest_asyncio.fixture
async def sgo_admin_user(db):
    from app.models.models import UserRole
    user = User(
        first_name="SGO", surname="Admin", gender=Gender.female,
        email="sgo@kab.ac.ug", password_hash=hash_password("sgopass123"),
        role=UserRole.sgo_admin, is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture
async def sgo_token(client, sgo_admin_user):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "sgo@kab.ac.ug", "password": "sgopass123"
    })
    return resp.json()["access_token"]
