from datetime import datetime, timedelta
from app.models import Card


def calculate_next_review(card: Card, rating: int) -> Card:
    """
    Calculates updated SRS parameters based on user rating:
      0: "Otra vez" / Again (Failed - Due immediately in session, interval resets to 1 day)
      1: "Difícil" / Hard
      2: "Normal" / Good
      3: "Fácil" / Easy
    """
    interval = card.interval_days or 1
    ease = card.ease_factor or 2.5
    reps = card.repetitions or 0

    if rating == 0:
        # Failed / Again: reset reps, back to 1 day interval, due immediately
        reps = 0
        interval = 1
        ease = max(1.3, ease - 0.2)
        card.next_review_date = datetime.utcnow()
    elif rating == 1:
        # Hard: slight interval growth, decrease ease factor
        reps += 1
        interval = max(1, int(interval * 1.2))
        ease = max(1.3, ease - 0.15)
        card.next_review_date = datetime.utcnow() + timedelta(days=interval)
    elif rating == 2:
        # Normal (Good): standard SM-2 interval progression
        reps += 1
        if reps == 1:
            interval = 1
        elif reps == 2:
            interval = 4
        else:
            interval = max(1, int(interval * ease))
        card.next_review_date = datetime.utcnow() + timedelta(days=interval)
    elif rating == 3:
        # Easy: accelerated growth and increased ease factor
        reps += 1
        if reps == 1:
            interval = 2
        elif reps == 2:
            interval = 6
        else:
            interval = max(1, int(interval * ease * 1.3))
        ease = min(3.0, ease + 0.15)
        card.next_review_date = datetime.utcnow() + timedelta(days=interval)

    card.repetitions = reps
    card.interval_days = interval
    card.ease_factor = round(ease, 2)
    card.updated_at = datetime.utcnow()

    return card
