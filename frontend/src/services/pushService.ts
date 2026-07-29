function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications(reminderTime: string = "20:00", token?: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Tu navegador o dispositivo no soporta Notificaciones Web Push.');
  }

  // Request Notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Debes permitir las notificaciones en la barra del navegador.');
  }

  // Obtain ServiceWorker registration
  let registration: ServiceWorkerRegistration;
  try {
    const readyPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout buscando ServiceWorker')), 2500)
    );
    registration = await Promise.race([readyPromise, timeoutPromise]);
  } catch {
    registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  }

  // Fetch VAPID public key from backend
  const keyRes = await fetch('/api/push/vapid-public-key');
  if (!keyRes.ok) {
    throw new Error('Error al obtener la clave VAPID del servidor.');
  }
  const { public_key } = await keyRes.json();

  const convertedKey = urlBase64ToUint8Array(public_key);

  // Unsubscribe previous subscription if existing to allow updating to new VAPID key
  const existingSub = await registration.pushManager.getSubscription();
  if (existingSub) {
    try {
      await existingSub.unsubscribe();
    } catch (unsubErr) {
      console.warn('Error eliminando suscripción previa:', unsubErr);
    }
  }

  // Subscribe using PushManager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey
  });

  const subJson = subscription.toJSON();

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const authToken = token || localStorage.getItem('flashcardapp_token');
  if (authToken) {
    authHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  // Send subscription payload to backend
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      },
      reminder_time: reminderTime
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Error guardando la suscripción en el servidor.');
  }

  return true;
}

export async function sendTestPushNotification(token?: string): Promise<number> {
  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const authToken = token || localStorage.getItem('flashcardapp_token');
  if (authToken) {
    authHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch('/api/push/test', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'FlashCardApp',
      body: '¡Prueba de notificación Push enviada con éxito a tu pantalla!'
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Error enviando notificación de prueba.');
  }

  const data = await res.json();
  return data.sent_count;
}
