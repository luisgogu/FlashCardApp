from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """SQLAlchemy model representing a user account."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    
    # Notification Preferences
    reminder_time = Column(String, default="20:00")
    reminder_enabled = Column(Boolean, default=True)
    notification_channel = Column(String, default="push")  # "off" | "push" | "mail" | "push_mail"
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    cards = relationship("Card", back_populates="owner", cascade="all, delete-orphan")
    push_subscriptions = relationship("PushSubscription", back_populates="owner", cascade="all, delete-orphan")


class Card(Base):
    """SQLAlchemy model representing a study flashcard (chunk)."""

    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    text_es = Column(String, nullable=False, index=True)  # Main phrase in Spanish
    translation_en = Column(String, nullable=False)        # English translation
    note = Column(Text, nullable=True)                    # Optional note/grammar context
    tags = Column(String, nullable=True, default="")      # Comma-separated tags (e.g. "comida, jerga")

    # Spaced Repetition System (SRS) parameters
    interval_days = Column(Integer, default=1)            # Days until next review
    ease_factor = Column(Float, default=2.5)              # SM-2 ease factor
    repetitions = Column(Integer, default=0)              # Number of successful repetitions
    next_review_date = Column(DateTime, default=datetime.utcnow, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="cards")


class PushSubscription(Base):
    """SQLAlchemy model representing Web Push subscriptions for daily reminders."""

    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    endpoint = Column(String, unique=True, index=True, nullable=False)
    p256dh = Column(String, nullable=False)
    auth = Column(String, nullable=False)
    reminder_time = Column(String, default="20:00")       # HH:MM format
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="push_subscriptions")

