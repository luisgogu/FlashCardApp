import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models


# Configuración JWT & Hashing
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "flashcardapp_secret_key_super_segura_2026_dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    """Hashea una contraseña usando bcrypt."""
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash."""
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token JWT de acceso."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[models.User]:
    """Obtiene el usuario actual si el token es válido, o None si no hay token."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            return None
        user_id = int(user_id_raw)
    except (jwt.PyJWTError, ValueError):
        return None

    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """Obtiene el usuario autenticado obligatorio (lanza 401 si no es válido)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales de autenticación no válidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise credentials_exception
        user_id = int(user_id_raw)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def create_password_reset_token(email: str, current_hashed_password: str) -> str:
    """Crea un token JWT de un solo uso para restablecer la contraseña (válido 30 mins)."""
    to_encode = {
        "sub": email.strip().lower(),
        "scope": "password_reset",
        "pwhash_prefix": current_hashed_password[:12]
    }
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=30)
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password_reset_token(token: str, current_hashed_password: str) -> Optional[str]:
    """Verifica la validez de un token de restablecimiento contra el hash de contraseña actual.
    Devuelve el email si es válido, o None si ha expirado, es inválido o ya fue usado."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("scope") != "password_reset":
            return None
        if payload.get("pwhash_prefix") != current_hashed_password[:12]:
            return None
        return payload.get("sub")
    except (jwt.PyJWTError, ValueError):
        return None


def verify_and_get_user_for_reset(token: str, db: Session) -> Optional[models.User]:
    """Decodifica el token, busca el usuario por email y valida la huella y expiración."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
        if payload.get("scope") != "password_reset":
            return None
        email = payload.get("sub")
        if not email:
            return None
        user = db.query(models.User).filter(func.lower(models.User.email) == email.strip().lower()).first()
        if not user:
            return None
        verified_email = verify_password_reset_token(token, user.hashed_password)
        if not verified_email:
            return None
        return user
    except Exception:
        return None


