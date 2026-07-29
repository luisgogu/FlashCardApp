import sys
import io

# Ensure UTF-8 output encoding for Windows console
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from app.database import SessionLocal
from app.models import Card
from datetime import datetime, timedelta

sample_verb_cards = [
    {
        "text_es": "comer",
        "translation_en": "to eat",
        "note": "Verbo regular de la segunda conjugación (-er)",
        "tags": "verbo, comida"
    },
    {
        "text_es": "hablar",
        "translation_en": "to speak",
        "note": "Verbo regular de la primera conjugación (-ar)",
        "tags": "verbo, comunicación"
    },
    {
        "text_es": "vivir",
        "translation_en": "to live",
        "note": "Verbo regular de la tercera conjugación (-ir)",
        "tags": "verbo, vida"
    },
    {
        "text_es": "ir",
        "translation_en": "to go",
        "note": "Verbo muy irregular básico",
        "tags": "verbo, movimiento"
    },
    {
        "text_es": "tener",
        "translation_en": "to have",
        "note": "Verbo irregular de posesión y estados",
        "tags": "verbo, basico"
    }
]


def seed_verbs():
    db = SessionLocal()
    try:
        created_count = 0
        now = datetime.utcnow()
        for idx, item in enumerate(sample_verb_cards):
            existing = db.query(Card).filter(Card.text_es == item["text_es"]).first()
            if not existing:
                card = Card(
                    text_es=item["text_es"],
                    translation_en=item["translation_en"],
                    note=item["note"],
                    tags=item["tags"],
                    next_review_date=now - timedelta(minutes=idx * 5)
                )
                db.add(card)
                created_count += 1

        db.commit()
        print(f"[OK] Se han añadido {created_count} verbos de ejemplo a la base de datos.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error al poblar verbos: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_verbs()
