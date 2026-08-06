import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Support DB_DIR or DATABASE_URL env vars for Cloud Run / persistent volume mounts
if os.path.exists("/tmp"):
    DB_DIR = "/tmp"
else:
    DB_DIR = os.getenv("DB_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "flashcardapp.db")

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# connect_args={"check_same_thread": False} is required for SQLite in multi-threaded FastAPI apps
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to provide a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_and_migrate_db():
    """Ensures SQLite tables have all required columns even if database was created previously."""
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if 'users' in tables:
            columns = [c['name'] for c in inspector.get_columns('users')]
            with engine.begin() as conn:
                if 'reminder_time' not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN reminder_time VARCHAR DEFAULT '20:00'"))
                if 'reminder_enabled' not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN reminder_enabled BOOLEAN DEFAULT 1"))
                if 'notification_channel' not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN notification_channel VARCHAR DEFAULT 'push'"))
                if 'is_admin' not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
        if 'cards' in tables:
            columns = [c['name'] for c in inspector.get_columns('cards')]
            with engine.begin() as conn:
                if 'user_id' not in columns:
                    conn.execute(text("ALTER TABLE cards ADD COLUMN user_id INTEGER"))
    except Exception as e:
        print(f"[DB Migration Warning] {e}")

