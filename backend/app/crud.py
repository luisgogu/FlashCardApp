import re
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Card, User, PushSubscription
from app import schemas
from app.srs import calculate_next_review
from app.auth_service import hash_password


def capitalize_tag_str(raw_tags: Optional[str]) -> str:
    """Format tags with first letter capitalized (e.g. 'verbo, comida' -> 'Verbo, Comida')."""
    if not raw_tags:
        return ""
    tags_list = [t.strip().capitalize() for t in raw_tags.split(',') if t.strip()]
    return ", ".join(tags_list)

# USER CRUD
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()

def create_user(db: Session, user_data: schemas.UserRegister) -> User:
    hashed_pwd = hash_password(user_data.password)
    user_count = db.query(User).count()
    email_clean = user_data.email.strip().lower()
    # ONLY the first registered user gets Admin privileges
    is_admin = (user_count == 0)
    
    db_user = User(
        email=email_clean,
        hashed_password=hashed_pwd,
        name=user_data.name.strip(),
        is_admin=is_admin,
        reminder_time="20:00",
        reminder_enabled=True,
        notification_channel="push",
        created_at=datetime.utcnow()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def change_user_password(db: Session, user: User, new_password: str) -> User:
    """Updates user hashed password in DB."""
    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user


def delete_user_account(db: Session, user: User) -> bool:
    """Deletes user account and all associated cards via cascade."""
    db.delete(user)
    db.commit()
    return True


def update_notification_settings(
    db: Session,
    user: User,
    settings: schemas.NotificationSettingsRequest
) -> User:
    """Updates user notification preferences (reminder_time, reminder_enabled, notification_channel)."""
    user.reminder_time = settings.reminder_time.strip()
    user.reminder_enabled = settings.reminder_enabled
    user.notification_channel = settings.notification_channel.strip().lower()
    db.commit()
    db.refresh(user)
    return user


# CARD CRUD (User-scoped)
def get_card(db: Session, card_id: int, user_id: Optional[int] = None) -> Optional[Card]:
    query = db.query(Card).filter(Card.id == card_id)
    if user_id is not None:
        query = query.filter((Card.user_id == user_id) | (Card.user_id == None))
    return query.first()


def get_cards(db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 1000) -> List[Card]:
    query = db.query(Card)
    if user_id is not None:
        query = query.filter((Card.user_id == user_id) | (Card.user_id == None))
    return query.order_by(Card.created_at.desc()).offset(skip).limit(limit).all()


def get_due_cards(db: Session, user_id: Optional[int] = None) -> List[Card]:
    """Retrieves all cards due for review for a user."""
    now = datetime.utcnow()
    query = db.query(Card).filter(Card.next_review_date <= now)
    if user_id is not None:
        query = query.filter((Card.user_id == user_id) | (Card.user_id == None))
    return query.order_by(Card.next_review_date.asc()).all()


def create_card(db: Session, card_data: schemas.CardCreate, user_id: Optional[int] = None) -> Card:
    db_card = Card(
        user_id=user_id,
        text_es=card_data.text_es.strip(),
        translation_en=card_data.translation_en.strip(),
        note=card_data.note.strip() if card_data.note else None,
        tags=capitalize_tag_str(card_data.tags),
        next_review_date=datetime.utcnow()
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


def update_card(db: Session, card_id: int, card_data: schemas.CardUpdate, user_id: Optional[int] = None) -> Optional[Card]:
    db_card = get_card(db, card_id, user_id=user_id)
    if not db_card:
        return None

    update_dict = card_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        if value is not None and isinstance(value, str):
            value = value.strip()
        if key == 'tags' and value is not None:
            value = capitalize_tag_str(value)
        setattr(db_card, key, value)

    db_card.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_card)
    return db_card


def get_all_user_tags(db: Session, user_id: int) -> List[str]:
    """Returns sorted list of all unique capitalized tags used across user's cards."""
    cards = db.query(Card).filter((Card.user_id == user_id) | (Card.user_id == None)).all()
    tags_set = set()
    for card in cards:
        if card.tags:
            for tag in card.tags.split(','):
                cleaned = tag.strip().capitalize()
                if cleaned:
                    tags_set.add(cleaned)
    return sorted(list(tags_set))


def delete_tag_globally(db: Session, tag_name: str, user_id: Optional[int] = None) -> int:
    """Removes a tag from all cards owned by the user."""
    tag_clean = tag_name.strip().lower()
    if not tag_clean:
        return 0
    query = db.query(Card)
    if user_id is not None:
        query = query.filter((Card.user_id == user_id) | (Card.user_id == None))
    cards = query.all()
    count = 0
    now = datetime.utcnow()
    for card in cards:
        if card.tags:
            tag_list = [t.strip() for t in card.tags.split(',') if t.strip()]
            new_tags = [t for t in tag_list if t.lower() != tag_clean]
            if len(new_tags) != len(tag_list):
                card.tags = capitalize_tag_str(", ".join(new_tags))
                card.updated_at = now
                count += 1
    db.commit()
    return count


def apply_tag_to_cards(db: Session, tag_name: str, card_ids: List[int], user_id: Optional[int] = None) -> int:
    """Applies a capitalized tag to specified card IDs owned by the user."""
    tag_cap = tag_name.strip().capitalize()
    if not tag_cap or not card_ids:
        return 0
    now = datetime.utcnow()
    query = db.query(Card).filter(Card.id.in_(card_ids))
    if user_id is not None:
        query = query.filter((Card.user_id == user_id) | (Card.user_id == None))
    cards = query.all()
    count = 0
    for card in cards:
        existing_tags = [t.strip() for t in (card.tags or "").split(',') if t.strip()]
        if not any(t.lower() == tag_cap.lower() for t in existing_tags):
            existing_tags.append(tag_cap)
            card.tags = capitalize_tag_str(", ".join(existing_tags))
            card.updated_at = now
            count += 1
    db.commit()
    return count


def review_card(db: Session, card_id: int, rating: int, user_id: Optional[int] = None) -> Optional[Card]:
    """Applies SRS review result to a card and updates database."""
    db_card = get_card(db, card_id, user_id=user_id)
    if not db_card:
        return None

    updated_card = calculate_next_review(db_card, rating)
    db.commit()
    db.refresh(updated_card)
    return updated_card


def delete_card(db: Session, card_id: int, user_id: Optional[int] = None) -> bool:
    db_card = get_card(db, card_id, user_id=user_id)
    if not db_card:
        return False
    db.delete(db_card)
    db.commit()
    return True


def delete_all_cards(db: Session, user_id: Optional[int] = None) -> int:
    """Deletes all cards belonging to the user."""
    query = db.query(Card)
    if user_id is not None:
        query = query.filter((Card.user_id == user_id) | (Card.user_id == None))
    count = query.delete(synchronize_session=False)
    db.commit()
    return count


def check_duplicates(db: Session, query: str, user_id: Optional[int] = None) -> schemas.DuplicateCheckResponse:
    query_clean = query.strip().lower()
    if not query_clean:
        return schemas.DuplicateCheckResponse(
            query=query,
            exact_match=None,
            partial_matches=[],
            has_duplicates=False
        )

    base_query = db.query(Card)
    if user_id is not None:
        base_query = base_query.filter((Card.user_id == user_id) | (Card.user_id == None))

    # 1. Exact match
    exact_match = base_query.filter(func.lower(Card.text_es) == query_clean).first()

    # 2. Partial matches
    all_cards = base_query.all()
    partial_matches = []
    exact_id = exact_match.id if exact_match else None

    for card in all_cards:
        if card.id == exact_id:
            continue
        card_text_lower = card.text_es.lower()
        is_word_match = False
        try:
            pattern = r'\b' + re.escape(card_text_lower) + r'\b'
            if re.search(pattern, query_clean):
                is_word_match = True
            elif len(card_text_lower) >= 4 and (card_text_lower in query_clean or query_clean in card_text_lower):
                is_word_match = True
        except Exception:
            if card_text_lower in query_clean:
                is_word_match = True

        if is_word_match:
            partial_matches.append(card)

    has_duplicates = (exact_match is not None) or (len(partial_matches) > 0)

    return schemas.DuplicateCheckResponse(
        query=query,
        exact_match=exact_match,
        partial_matches=partial_matches,
        has_duplicates=has_duplicates
    )


# PUSH SUBSCRIPTION CRUD
def create_or_update_push_subscription(db: Session, user_id: int, sub_data: schemas.PushSubscriptionCreate) -> PushSubscription:
    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == sub_data.endpoint).first()
    now = datetime.utcnow()
    reminder_time = sub_data.reminder_time or "20:00"
    
    if existing:
        existing.user_id = user_id
        existing.p256dh = sub_data.keys.p256dh
        existing.auth = sub_data.keys.auth
        existing.reminder_time = reminder_time
        existing.is_active = True
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_sub = PushSubscription(
            user_id=user_id,
            endpoint=sub_data.endpoint,
            p256dh=sub_data.keys.p256dh,
            auth=sub_data.keys.auth,
            reminder_time=reminder_time,
            is_active=True
        )
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return new_sub
