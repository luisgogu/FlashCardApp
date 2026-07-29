import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test():
    print("--- 1. Probar VAPID public key ---")
    res = requests.get(f"{BASE_URL}/push/vapid-public-key")
    print("VAPID Key:", res.json())
    assert res.status_code == 200
    assert "public_key" in res.json()

    print("\n--- 2. Registrar usuario de prueba ---")
    import time
    email = f"user_{int(time.time())}@ejemplo.com"
    user_payload = {
        "email": email,
        "password": "mi_password_secreta",
        "name": "Estudiante"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=user_payload)
    if res.status_code == 400:
        print("Usuario ya existía, probando login...")
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": "mi_password_secreta"})
    
    assert res.status_code in [200, 201], res.text
    data = res.json()
    token = data["access_token"]
    print("Token generado exitosamente:", token[:30], "...")
    print("Usuario:", data["user"])

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Probar /api/auth/me ---")
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    assert res.status_code == 200
    print("Perfil de usuario obtenido:", res.json())

    print("\n--- 4. Crear tarjeta asignada al usuario ---")
    card_data = {
        "text_es": "Tengo ganas de comer tacos",
        "translation_en": "I feel like eating tacos",
        "tags": "comida, tacos"
    }
    res = requests.post(f"{BASE_URL}/cards", json=card_data, headers=headers)
    print("CARD RESPONSE STATUS:", res.status_code)
    print("CARD RESPONSE BODY:", res.text)
    assert res.status_code == 201
    card = res.json()
    print("Tarjeta creada con éxito:", card["id"], card["text_es"])

    print("\n¡Prueba de backend Auth y Push completada con ÉXITO! 🎉")

if __name__ == "__main__":
    test()
