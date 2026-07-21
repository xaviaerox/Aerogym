/**
 * Servicio de notificaciones nativas de navegador / Web Push
 * para temporizadores de descanso de entrenamiento en PWA.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function sendRestTimerNotification(exerciseName: string, seconds: number): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const title = '⏰ ¡Tiempo de Descanso Finalizado!';
    const options: NotificationOptions = {
      body: `Tu descanso de ${seconds}s para ${exerciseName} ha terminado. ¡A por la siguiente serie!`,
      icon: '/Aerogym/icon-192.png',
      badge: '/Aerogym/icon-192.png',
      tag: 'rest-timer',
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  }
}
