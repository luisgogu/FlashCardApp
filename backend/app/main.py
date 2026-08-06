import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base, get_db
from app import models, schemas, crud, conjugator_service, translation_service
from app.auth_service import (
    create_access_token,
    verify_password,
    hash_password,
    get_current_user,
    get_current_user_optional
)
from app.vapid_service import get_or_create_vapid_keys
from app.push_service import send_web_push
from app.scheduler import start_scheduler, stop_scheduler
from app.gcs_sync import download_db_from_gcs, upload_db_to_gcs

# Download DB from GCS if running on Cloud Run before creating tables
download_db_from_gcs()

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Iniciar scheduler y VAPID keys
    get_or_create_vapid_keys()
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()
    upload_db_to_gcs()

app = FastAPI(
    title="FlashCardApp API",
    description="Backend API for FlashCardApp PWA language study cards with real-time duplicate checking, SRS engine, verb conjugator, Auth, and Web Push notifications.",
    version="1.0.0",
    lifespan=lifespan
)

# Allow CORS for development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "ok", "app": "FlashCardApp API", "version": "1.0.0"}


# ==========================================
# AUTH ENDPOINTS
# ==========================================
@app.post("/api/auth/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: schemas.UserRegister,
    db: Session = Depends(get_db)
):
    """[AUTH] Registra una nueva cuenta de usuario y devuelve el token JWT."""
    existing = crud.get_user_by_email(db=db, email=user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
    
    user = crud.create_user(db=db, user_data=user_data)
    upload_db_to_gcs()
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login_user(
    login_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """[AUTH] Inicia sesión con correo y contraseña, devolviendo el token JWT."""
    user = crud.get_user_by_email(db=db, email=login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos"
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(
    current_user: models.User = Depends(get_current_user)
):
    """[AUTH] Obtiene los datos del perfil del usuario actualmente autenticado."""
    return current_user


@app.post("/api/auth/change-password")
def change_password_api(
    req: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """[AUTH] Cambia la contraseña del usuario tras verificar su contraseña actual."""
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta."
        )
    crud.change_user_password(db=db, user=current_user, new_password=req.new_password)
    return {"status": "ok", "message": "Contraseña actualizada con éxito."}


# ==========================================
# NOTIFICATION PREFERENCES & EMAIL ENDPOINTS
# ==========================================
@app.get("/api/notifications/settings", response_model=schemas.NotificationSettingsResponse)
def get_notification_settings_api(
    current_user: models.User = Depends(get_current_user)
):
    """[NOTIFICATIONS] Obtiene las preferencias de notificación del usuario."""
    return {
        "reminder_time": current_user.reminder_time or "20:00",
        "reminder_enabled": current_user.reminder_enabled if current_user.reminder_enabled is not None else True,
        "notification_channel": current_user.notification_channel or "push"
    }


@app.post("/api/notifications/settings", response_model=schemas.NotificationSettingsResponse)
def update_notification_settings_api(
    req: schemas.NotificationSettingsRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """[NOTIFICATIONS] Actualiza la hora, estado y canal (off / push / mail / push_mail)."""
    updated_user = crud.update_notification_settings(db=db, user=current_user, settings=req)
    return {
        "reminder_time": updated_user.reminder_time,
        "reminder_enabled": updated_user.reminder_enabled,
        "notification_channel": updated_user.notification_channel
    }


@app.post("/api/notifications/test-email")
def send_test_email_api(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """[NOTIFICATIONS] Envía un correo electrónico de prueba al usuario."""
    from app.email_service import send_email_notification
    due = crud.get_due_cards(db=db, user_id=current_user.id)
    success, is_mock = send_email_notification(
        to_email=current_user.email,
        user_name=current_user.name,
        due_count=len(due),
        is_test=True
    )
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Error enviando el correo de prueba."
        )
    if is_mock:
        msg = f"Modo simulación: El correo a {current_user.email} se registró en la consola. (Configura SMTP en .env para envíos reales)"
    else:
        msg = f"¡Correo enviado con éxito a tu bandeja {current_user.email}!"
        
    return {"status": "ok", "is_mock": is_mock, "message": msg}


# ==========================================
# WEB PUSH ENDPOINTS
# ==========================================
@app.get("/api/push/vapid-public-key")
def get_vapid_public_key():
    """[PUSH] Devuelve la clave pública VAPID del servidor para la suscripción del navegador."""
    keys = get_or_create_vapid_keys()
    return {"public_key": keys["public_key"]}


@app.post("/api/push/subscribe", response_model=schemas.PushSubscriptionResponse)
def subscribe_push_notifications(
    sub_data: schemas.PushSubscriptionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """[PUSH] Registra o actualiza la suscripción Web Push del usuario y su hora preferida."""
    return crud.create_or_update_push_subscription(db=db, user_id=current_user.id, sub_data=sub_data)


@app.delete("/api/push/unsubscribe")
def unsubscribe_push_notifications(
    endpoint: str = Query(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """[PUSH] Desactiva la suscripción Web Push."""
    sub = db.query(models.PushSubscription).filter(
        models.PushSubscription.endpoint == endpoint,
        models.PushSubscription.user_id == current_user.id
    ).first()
    if sub:
        sub.is_active = False
        db.commit()
    return {"status": "ok", "message": "Suscripción desactivada."}


@app.post("/api/push/test")
def send_test_push_notification(
    req: schemas.PushTestRequest = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """[PUSH] Envía inmediatamente una notificación de prueba a todos los dispositivos del usuario."""
    subs = db.query(models.PushSubscription).filter(
        models.PushSubscription.user_id == current_user.id,
        models.PushSubscription.is_active == True
    ).all()
    
    if not subs:
        raise HTTPException(
            status_code=400,
            detail="No tienes dispositivos registrados para recibir notificaciones Push."
        )

    title = req.title if req and req.title else "FlashCardApp - Prueba"
    body = req.body if req and req.body else f"¡Hola {current_user.name}! Notificación de prueba funcionando."

    payload = {
        "title": title,
        "body": body,
        "icon": "/icon-192x192.png",
        "badge": "/favicon.svg",
        "url": "/"
    }
    
    sent_count = 0
    for sub in subs:
        sub_info = {
            "endpoint": sub.endpoint,
            "keys": {"p256dh": sub.p256dh, "auth": sub.auth}
        }
        if send_web_push(sub_info, payload):
            sent_count += 1

    return {"status": "ok", "sent_count": sent_count, "total_subscriptions": len(subs)}


# ==========================================
# TRANSLATION & VERB CONJUGATOR
# ==========================================
@app.get("/api/translate/suggest")
def suggest_translation(
    text: str = Query(..., min_length=1, description="Frase en español a traducir y corregir")
):
    """[TRANSLATION API] Sugerencias ortográficas en español y traducción en tiempo real al inglés."""
    return translation_service.suggest_translation_and_correction(text_es=text)


@app.get("/api/verbs/conjugate")
def get_verb_conjugations_api(
    verb: str = Query(..., min_length=1, description="Verbo en español en infinitivo"),
    translation: str = Query("", description="Traducción en inglés opcional")
):
    """[VERB CONJUGATOR API] Genera la tabla de conjugación en 5 tiempos verbales."""
    return conjugator_service.get_verb_conjugations(verb_es=verb, verb_en=translation)


# ==========================================
# CARDS & TAGS ENDPOINTS (STRICT USER ISOLATION)
# ==========================================
@app.delete("/api/tags/{tag_name}")
def delete_tag_globally_api(
    tag_name: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = crud.delete_tag_globally(db=db, tag_name=tag_name, user_id=current_user.id)
    return {"status": "ok", "message": f"Etiqueta '{tag_name}' eliminada de {count} tarjetas.", "affected_count": count}


@app.post("/api/tags/apply")
def apply_tag_to_cards_api(
    req: schemas.TagApplyRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = crud.apply_tag_to_cards(db=db, tag_name=req.tag_name, card_ids=req.card_ids, user_id=current_user.id)
    return {"status": "ok", "message": f"Etiqueta '{req.tag_name}' aplicada a {count} tarjetas.", "affected_count": count}


@app.get("/api/cards/check-duplicate", response_model=schemas.DuplicateCheckResponse)
def check_duplicate_card(
    query: str = Query(..., min_length=1, description="Texto en español para comprobar duplicados"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.check_duplicates(db=db, query=query, user_id=current_user.id)


@app.get("/api/cards/due", response_model=List[schemas.CardResponse])
def get_due_cards(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_due_cards(db=db, user_id=current_user.id)


@app.post("/api/cards/{card_id}/review", response_model=schemas.CardResponse)
def review_card(
    card_id: int,
    review: schemas.ReviewRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = crud.review_card(db=db, card_id=card_id, rating=review.rating, user_id=current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    upload_db_to_gcs()
    return updated


@app.post("/api/cards", response_model=schemas.CardResponse, status_code=status.HTTP_201_CREATED)
def create_new_card(
    card: schemas.CardCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_card = crud.create_card(db=db, card_data=card, user_id=current_user.id)
    upload_db_to_gcs()
    return new_card


@app.get("/api/cards", response_model=List[schemas.CardResponse])
def list_cards(
    skip: int = 0,
    limit: int = 1000,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_cards(db=db, user_id=current_user.id, skip=skip, limit=limit)


@app.delete("/api/cards/all")
@app.delete("/api/cards")
def delete_all_cards_api(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = crud.delete_all_cards(db=db, user_id=current_user.id)
    upload_db_to_gcs()
    return {"status": "ok", "message": f"Se han eliminado {count} tarjetas.", "deleted_count": count}


@app.get("/api/cards/{card_id}", response_model=schemas.CardResponse)
def get_card(
    card_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_card = crud.get_card(db=db, card_id=card_id, user_id=current_user.id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    return db_card


@app.put("/api/cards/{card_id}", response_model=schemas.CardResponse)
def update_card(
    card_id: int,
    card_update: schemas.CardUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = crud.update_card(db=db, card_id=card_id, card_data=card_update, user_id=current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    return updated


@app.delete("/api/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_card(db=db, card_id=card_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    return None


# ==========================================
# DEBUG / DEV HELPER ENDPOINTS
# ==========================================
@app.post("/api/debug/reset-srs")
def debug_reset_srs(
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """[DEBUG] Resetea las fechas de repaso a 'hoy'."""
    user_id = current_user.id if current_user else None
    now = datetime.utcnow()
    query = db.query(models.Card)
    if user_id is not None:
        query = query.filter((models.Card.user_id == user_id) | (models.Card.user_id == None))
    cards = query.all()
    for card in cards:
        card.next_review_date = now
        card.repetitions = 0
        card.interval_days = 1
        card.ease_factor = 2.5
        card.updated_at = now
    db.commit()
    return {
        "status": "ok",
        "message": f"Se han reseteado {len(cards)} tarjetas para repaso inmediato.",
        "reset_count": len(cards)
    }
