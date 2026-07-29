import os
import json
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

VAPID_FILE = os.path.join(os.path.dirname(__file__), "..", "vapid_keys.json")

def urlsafe_b64encode(data: bytes) -> str:
    """Helper to URL-safe base64 encode without trailing '=' padding."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def generate_vapid_keys():
    """Generates standard 32-byte raw private key & 65-byte uncompressed public key VAPID pair."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    
    # Raw 32-byte private scalar number
    priv_bytes = private_key.private_numbers().private_value.to_bytes(32, 'big')
    priv_b64 = urlsafe_b64encode(priv_bytes)
    
    # Raw 65-byte uncompressed public point (0x04 + X + Y)
    pub_bytes = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )
    pub_b64 = urlsafe_b64encode(pub_bytes)
    
    return {
        "public_key": pub_b64,
        "private_key": priv_b64,
        "subscriber": "mailto:luisgogu2001@gmail.com"
    }

def get_or_create_vapid_keys():
    """Genera o recupera el par de claves VAPID guardadas en vapid_keys.json."""
    if os.path.exists(VAPID_FILE):
        try:
            with open(VAPID_FILE, "r") as f:
                data = json.load(f)
                if "public_key" in data and "private_key" in data:
                    return data
        except Exception as e:
            print(f"[VAPID] Error cargando vapid_keys.json: {e}")
    
    keys = generate_vapid_keys()

    try:
        with open(VAPID_FILE, "w") as f:
            json.dump(keys, f, indent=2)
        print("[VAPID] Claves VAPID generadas y guardadas correctamente en vapid_keys.json")
    except Exception as e:
        print(f"[VAPID] Error guardando vapid_keys.json: {e}")

    return keys
