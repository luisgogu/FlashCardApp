import json
from pywebpush import webpush, WebPushException
from app.vapid_service import get_or_create_vapid_keys

def send_web_push(subscription_info: dict, payload_data: dict) -> bool:
    """
    Envía una notificación Web Push a la suscripción del navegador dada.
    subscription_info: dict con {'endpoint': ..., 'keys': {'p256dh': ..., 'auth': ...}}
    """
    vapid_keys = get_or_create_vapid_keys()
    
    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload_data),
            vapid_private_key=vapid_keys["private_key"],
            vapid_claims={
                "sub": vapid_keys.get("subscriber", "mailto:luisgogu2001@gmail.com")
            },
            ttl=86400
        )
        print(f"[PUSH] Notificación enviada con éxito a {subscription_info['endpoint'][:30]}...")
        return True
    except WebPushException as ex:
        print(f"[PUSH] Exception al enviar Web Push: {ex}")
        if ex.response and ex.response.status_code in [404, 410]:
            print("[PUSH] Suscripción expirada o removida (404/410).")
        return False
    except Exception as ex:
        print(f"[PUSH] Error general enviando Web Push: {ex}")
        return False
