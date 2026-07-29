import sys
import io

# Ensure UTF-8 output encoding for Windows console
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_flow():
    print("--- 1. Probar Root Endpoint ---")
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print("[OK] Root OK:", response.json())

    print("\n--- 2. Crear Tarjeta de prueba SRS ---")
    card_payload = {
        "text_es": "Tener ganas de",
        "translation_en": "To feel like",
        "note": "Estructura verbal",
        "tags": "gramatica"
    }
    res1 = client.post("/api/cards", json=card_payload)
    assert res1.status_code == 201
    card1 = res1.json()
    print("[OK] Tarjeta creada, ID:", card1["id"])

    print("\n--- 3. Obtener Tarjetas Pendientes (GET /api/cards/due) ---")
    res_due = client.get("/api/cards/due")
    assert res_due.status_code == 200
    due_cards = res_due.json()
    assert len(due_cards) > 0
    print(f"[OK] Tarjetas pendientes obtenidas: {len(due_cards)}")

    print("\n--- 4. Enviar Repaso SRS (Rating 2: Bien) ---")
    res_rev = client.post(f"/api/cards/{card1['id']}/review", json={"rating": 2})
    assert res_rev.status_code == 200
    updated_card = res_rev.json()
    assert updated_card["repetitions"] >= 1
    assert updated_card["interval_days"] >= 1
    print("[OK] Repaso procesado correctamente! Próximo intervalo (días):", updated_card["interval_days"])

    print("\n==========================================")
    print("¡TODOS LOS TESTS DE LA FASE 3 HAN PASADO!")
    print("==========================================")


if __name__ == "__main__":
    try:
        test_api_flow()
    except Exception as e:
        print("[ERROR] Error en las pruebas de la API SRS:", e)
        sys.exit(1)
