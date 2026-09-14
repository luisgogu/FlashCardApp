from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, SessionLocal
from app import crud, schemas, models
from app.auth_service import create_password_reset_token, verify_password_reset_token, verify_password

client = TestClient(app)

def test_forgot_and_reset_password_flow():
    db = SessionLocal()
    test_email = "test_reset_user@example.com"
    initial_pwd = "initial_password_123"
    new_pwd = "new_super_password_456"

    # Clean up if existed
    existing = crud.get_user_by_email(db, test_email)
    if existing:
        crud.delete_user_account(db, existing)

    # 1. Register test user
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": initial_pwd,
        "name": "Test Reset User"
    })
    assert reg_res.status_code == 201, reg_res.text
    user = crud.get_user_by_email(db, test_email)
    assert user is not None
    assert verify_password(initial_pwd, user.hashed_password)

    # 2. Test forgot password endpoint (for existing email)
    forgot_res = client.post("/api/auth/forgot-password", json={"email": test_email})
    assert forgot_res.status_code == 200
    assert "status" in forgot_res.json()
    assert forgot_res.json()["status"] == "ok"

    # 3. Test forgot password endpoint (for non-existent email -> should succeed gracefully)
    forgot_ghost = client.post("/api/auth/forgot-password", json={"email": "nonexistent_ghost@example.com"})
    assert forgot_ghost.status_code == 200
    assert forgot_ghost.json()["status"] == "ok"

    # 4. Generate token and test reset-password endpoint
    user = crud.get_user_by_email(db, test_email)
    token = create_password_reset_token(user.email, user.hashed_password)
    
    # 5. Reset with valid token
    reset_res = client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": new_pwd
    })
    assert reset_res.status_code == 200, reset_res.text
    assert reset_res.json()["status"] == "ok"

    # Refresh user and check password
    db.refresh(user)
    assert verify_password(new_pwd, user.hashed_password)
    assert not verify_password(initial_pwd, user.hashed_password)

    # 6. Verify single-use: re-submitting the exact same token must fail!
    reuse_res = client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": "another_password_789"
    })
    assert reuse_res.status_code == 400
    assert "inválido" in reuse_res.json()["detail"] or "expirado" in reuse_res.json()["detail"]

    # 7. Verify login with new password works
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": new_pwd
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 7. Test bilingual email templates and ensure no author footer
    from app.email_service import build_password_reset_email_template, build_email_template
    
    subj_es, html_es = build_password_reset_email_template("Carlos", "https://example.com/reset?token=1", lang="es")
    assert "Restablece tu contraseña" in subj_es
    assert "Restablecer mi contraseña" in html_es
    assert "Luis González" not in html_es
    assert "FlashCardApp • Aprende vocabulario en contexto" in html_es or "FlashCardApp &bull; Aprende vocabulario en contexto" in html_es

    subj_en, html_en = build_password_reset_email_template("John", "https://example.com/reset?token=2", lang="en")
    assert "Reset your account password" in subj_en
    assert "Reset my password" in html_en
    assert "Luis González" not in html_en
    assert "FlashCardApp • Learn vocabulary in context" in html_en or "FlashCardApp &bull; Learn vocabulary in context" in html_en

    reminder_html = build_email_template("Maria", 5)
    assert "Luis González" not in reminder_html

    # Clean up test user
    crud.delete_user_account(db, user)
    db.close()
    print("\n[SUCCESS] All forgot & reset password + bilingual tests PASSED successfully!")

if __name__ == "__main__":
    test_forgot_and_reset_password_flow()

