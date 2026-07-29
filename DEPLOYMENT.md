# 🚀 Guía de Despliegue en la Nube ($0 / Gratuito 24/7) - FlashCardApp

Esta guía explica cómo publicar **FlashCardApp** en la nube de forma **100% gratuita** con **Vercel** (Frontend PWA) y **Google Cloud Run** o **Render** (Backend FastAPI), habilitando dominio HTTPS seguro para notificaciones Push nativas y avisos por correo en Android, iOS y PC.

---

## OPCIÓN A: Desplegar Backend en Google Cloud Run ($0 / mes - RECOMENDADO)

Google Cloud Run incluye **2 millones de peticiones gratis al mes para siempre (Always Free)**. A diferencia de Render, el arranque de Cloud Run en Python toma solo 1-2 segundos.

### Pasos en Google Cloud Shell:
1. En la consola de Google Cloud ([console.cloud.google.com](https://console.cloud.google.com)), activa **Cloud Shell** (icono `>_` arriba a la derecha).
2. Ejecuta los siguientes comandos:

```bash
git clone https://github.com/luisgogu/FlashCardApp.git
cd FlashCardApp/backend
gcloud run deploy flashcardapp-backend --source . --region europe-west1 --allow-unauthenticated
```

3. Te devolverá una URL HTTPS propia (ejemplo: `https://flashcardapp-backend-xyz-ew.a.run.app`).

---

## OPCIÓN B: Desplegar Backend en Render.com ($0 / mes)

1. Ve a **[Render.com](https://render.com/)** e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **New +** -> **Web Service**.
3. Selecciona tu repositorio `FlashCardApp`.
4. Configura los campos:
   - **Name**: `flashcardapp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. En **Environment Variables**, añade tus credenciales SMTP:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `luisgogu2001@gmail.com`
   - `SMTP_PASSWORD`: `nfvv qnzj eded swxa`
   - `SMTP_FROM_EMAIL`: `FlashCardApp <luisgogu2001@gmail.com>`
6. Haz clic en **Create Web Service**.

---

## Desplegar el Frontend en Vercel ($0 / mes)

1. Ve a **[Vercel.com](https://vercel.com/)** e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New...** -> **Project**.
3. Selecciona tu repositorio `FlashCardApp`.
4. En **Root Directory**, selecciona la carpeta `frontend`.
5. En **Framework Preset**, selecciona `Vite`.
6. Haz clic en **Deploy**.  
   👉 ¡Listo! Vercel te dará una URL HTTPS como `https://flashcardapp.vercel.app`.

---

## Vincular Frontend y Backend

1. Abre el archivo [frontend/vercel.json](file:///c:/Users/luisg/Documents/FlashCardApp/frontend/vercel.json) y actualiza la línea `dest` con la URL de tu backend (de Cloud Run o Render):
   ```json
   "dest": "https://TU-URL-DEL-BACKEND/api/$1"
   ```
2. Haz `git commit` y `git push`. Vercel actualizará la PWA automáticamente.

---

## 📱 ¡A disfrutar de FlashCardApp 24/7!

- Abre `https://flashcardapp.vercel.app` en tu móvil Android (Chrome) o iPhone (Safari).
- En iOS: Pulsa **Compartir** -> **Añadir a la pantalla de inicio**.
- En Android: Pulsa los 3 puntos -> **Instalar aplicación**.
- Las notificaciones Web Push y los correos electrónicos funcionarán 24 horas al día desde cualquier lugar.
