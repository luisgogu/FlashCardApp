from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CardBase(BaseModel):
    text_es: str = Field(..., min_length=1, description="Frase o chunk en español")
    translation_en: str = Field(..., min_length=1, description="Traducción al inglés")
    note: Optional[str] = Field(None, description="Notas de gramática, uso o contexto")
    tags: Optional[str] = Field("", description="Etiquetas separadas por comas (ej. verbo, comida)")


class CardCreate(CardBase):
    pass


class CardUpdate(BaseModel):
    text_es: Optional[str] = None
    translation_en: Optional[str] = None
    note: Optional[str] = None
    tags: Optional[str] = None


class CardResponse(CardBase):
    id: int
    interval_days: int
    ease_factor: float
    repetitions: int
    next_review_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DuplicateCheckResponse(BaseModel):
    query: str
    exact_match: Optional[CardResponse] = None
    partial_matches: List[CardResponse] = []
    has_duplicates: bool


class ReviewRequest(BaseModel):
    rating: int = Field(..., ge=0, le=3, description="Evaluación SRS (0=Again/Otra vez, 1=Hard/Difícil, 2=Good/Normal, 3=Easy/Fácil)")


class TagApplyRequest(BaseModel):
    tag_name: str = Field(..., min_length=1, description="Nombre de la etiqueta a aplicar")
    card_ids: List[int] = Field(..., min_length=1, description="Lista de IDs de tarjetas")


# User Auth Schemas
class UserRegister(BaseModel):
    email: str = Field(..., min_length=3, description="Correo electrónico del usuario")
    password: str = Field(..., min_length=4, description="Contraseña de acceso")
    name: str = Field(..., min_length=1, description="Nombre o apodo del estudiante")


class UserLogin(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Contraseña actual")
    new_password: str = Field(..., min_length=4, description="Nueva contraseña (mínimo 4 caracteres)")


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=3, description="Correo electrónico de la cuenta")
    lang: Optional[str] = Field("es", description="Idioma preferido para el correo ('es' o 'en')")



class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10, description="Token JWT de restablecimiento")
    new_password: str = Field(..., min_length=4, description="Nueva contraseña (mínimo 4 caracteres)")



class NotificationSettingsRequest(BaseModel):
    reminder_time: str = Field("20:00", description="Hora preferida de aviso (HH:MM)")
    reminder_enabled: bool = Field(True, description="Si el aviso del juego/repaso diario SRS está activado")
    word_notification_enabled: Optional[bool] = Field(None, description="Si la notificación de palabra en pantalla de bloqueo está activada")
    notification_channel: str = Field("push", description="Canal: off | push | mail | push_mail")
    timezone: Optional[str] = Field(None, description="Zona horaria IANA del dispositivo (ej. Europe/Madrid)")


class NotificationSettingsResponse(BaseModel):
    reminder_time: str
    reminder_enabled: bool
    word_notification_enabled: bool = False
    notification_channel: str
    timezone: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_admin: Optional[bool] = False
    reminder_time: Optional[str] = "20:00"
    reminder_enabled: Optional[bool] = True
    word_notification_enabled: Optional[bool] = False
    notification_channel: Optional[str] = "push"
    timezone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Web Push Schemas
class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: PushSubscriptionKeys
    reminder_time: Optional[str] = "20:00"


class PushSubscriptionResponse(BaseModel):
    id: int
    endpoint: str
    reminder_time: str
    is_active: bool

    class Config:
        from_attributes = True


class PushTestRequest(BaseModel):
    title: Optional[str] = "FlashCardApp"
    body: Optional[str] = "Prueba de notificación Web Push funcionando correctamente."

