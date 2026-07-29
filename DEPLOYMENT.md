# 🚀 Guía de Despliegue en la Nube ($0 / Gratuito 24/7) - FlashCardApp

Esta guía explica cómo publicar **FlashCardApp** en internet de forma **100% gratuita** con **Vercel** (Frontend PWA) y **Render** (Backend FastAPI), habilitando dominio HTTPS seguro para notificaciones Push nativas y avisos por correo en Android, iOS y PC.

---

## PASO 1: Subir el código a GitHub

1. Crea un nuevo repositorio en [GitHub.com](https://github.com/new) llamado `FlashCardApp`.
2. En la terminal de tu ordenador, ejecuta estos comandos:

```bash
git init
git add .
git commit -m "FlashCardApp v1.0.0 - Versión completa"
git branch -M main
git remote add origin https://github.com/TU_USUARIO_GITHUB/FlashCardApp.git
git push -u origin main
```

---

## PASO 2: Desplegar el Backend en Render.com ($0 / mes)

1. Ve a **[Render.com](https://render.com/)** e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **New +** -> **Web Service**.
3. Selecciona tu repositorio `FlashCardApp`.
4. Configura los siguientes campos:
   - **Name**: `flashcardapp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. En **Environment Variables**, añade tus credenciales SMTP de correo:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `luisgogu2001@gmail.com`
   - `SMTP_PASSWORD`: `nfvv qnzj eded swxa`
   - `SMTP_FROM_EMAIL`: `FlashCardApp <luisgogu2001@gmail.com>`
6. Haz clic en **Create Web Service**.  
   👉 Obtendrás la URL de tu API (ejemplo: `https://flashcardapp-backend.onrender.com`).

---

## PASO 3: Desplegar el Frontend en Vercel ($0 / mes)

1. Ve a **[Vercel.com](https://vercel.com/)** e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New...** -> **Project**.
3. Selecciona tu repositorio `FlashCardApp`.
4. En **Root Directory**, selecciona la carpeta `frontend`.
5. En **Framework Preset**, selecciona `Vite`.
6. Haz clic en **Deploy**.  
   👉 ¡Listo! Vercel te dará una URL HTTPS como `https://flashcardapp.vercel.app`.

---

## PASO 4: Vincular Frontend y Backend

1. Si la URL de tu backend en Render es diferente a `https://flashcardapp-backend.onrender.com`, abre el archivo [frontend/vercel.json](file:///c:/Users/luisg/Documents/FlashCardApp/frontend/vercel.json) y actualiza la línea:
   ```json
   "dest": "https://TU-BACKEND-RENDER.onrender.com/api/$1"
   ```
2. Guarda, haz `git commit` y `git push`. Vercel actualizará la PWA automáticamente.

---

## 📱 ¡A disfrutar de FlashCardApp 24/7!

- Abre `https://flashcardapp.vercel.app` en tu móvil Android (Chrome) o iPhone (Safari).
- En iOS: Pulsa **Compartir** -> **Añadir a la pantalla de inicio**.
- En Android: Pulsa los 3 puntos -> **Instalar aplicación**.
- Las notificaciones Web Push y los correos electrónicos funcionarán 24 horas al día desde cualquier lugar.
