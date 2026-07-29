import requests

BASE_URL = "http://127.0.0.1:8000"

def test_phase6_features():
    print("--- 1. REGISTRANDO USUARIO DE PRUEBA ---")
    reg_res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": "test_phase6@ejemplo.com",
        "password": "password123",
        "name": "Tester Phase 6"
    })
    if reg_res.status_code != 200:
        # Intenta login si ya existe
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_phase6@ejemplo.com",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
    else:
        token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Token obtenido exitosamente.")

    print("\n--- 2. PROBANDO PREFERENCIAS DE NOTIFICACION (GET / POST) ---")
    settings_get = requests.get(f"{BASE_URL}/api/notifications/settings", headers=headers)
    print("GET Settings:", settings_get.json())

    settings_post = requests.post(f"{BASE_URL}/api/notifications/settings", json={
        "reminder_time": "18:30",
        "reminder_enabled": True,
        "notification_channel": "push_mail"
    }, headers=headers)
    print("POST Settings:", settings_post.json())
    assert settings_post.json()["notification_channel"] == "push_mail"
    assert settings_post.json()["reminder_time"] == "18:30"
    print("[OK] Preferencias de notificacion guardadas correctamente.")

    print("\n--- 3. PROBANDO ENVIO DE CORREO DE PRUEBA ---")
    test_email_res = requests.post(f"{BASE_URL}/api/notifications/test-email", headers=headers)
    print("Test Email Res:", test_email_res.json())
    assert test_email_res.status_code == 200
    print("[OK] Correo de prueba enviado con exito.")

    print("\n--- 4. PROBANDO CAMBIO DE CONTRASEÑA ---")
    # Error con contraseña vieja errónea
    bad_change = requests.post(f"{BASE_URL}/api/auth/change-password", json={
        "current_password": "wrong_password",
        "new_password": "newpassword123"
    }, headers=headers)
    assert bad_change.status_code == 400
    print("[OK] Rechazado correctamente cambio con contraseña actual errónea.")

    # Cambio exitoso
    good_change = requests.post(f"{BASE_URL}/api/auth/change-password", json={
        "current_password": "password123",
        "new_password": "newpassword123"
    }, headers=headers)
    assert good_change.status_code == 200
    print("[OK] Cambio de contraseña realizado con exito.")

    # Verificación de login con nueva contraseña
    login_new = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test_phase6@ejemplo.com",
        "password": "newpassword123"
    })
    assert login_new.status_code == 200
    print("[OK] Login verificado con la nueva contraseña.")

    print("\n[OK] TODAS LAS PRUEBAS AUTOMATIZADAS PASARON EXITOSAMENTE.")

if __name__ == "__main__":
    test_phase6_features()
