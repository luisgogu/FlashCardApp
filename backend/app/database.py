import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "flashcardapp.db"))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

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
