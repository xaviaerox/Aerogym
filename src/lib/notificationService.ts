/**
 * Servicio de notificaciones nativas de navegador / Web Push
 * para temporizadores de descanso, alertas de Readiness y recordatorios de entrenamiento en PWA.
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
    const options: NotificationOptions & { vibrate?: number[] } = {
      body: `Tu descanso de ${seconds}s para ${exerciseName} ha terminado. ¡A por la siguiente serie!`,
      icon: '/Aerogym/icon-192.png',
      badge: '/Aerogym/icon-192.png',
      tag: 'rest-timer',
      vibrate: [200, 100, 200],
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, options as NotificationOptions);
    } else {
      new Notification(title, options as NotificationOptions);
    }
  }
}

export async function sendDailyReadinessNotification(score: number, recommendation: string): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const title = `🟢 AeroGym Readiness: ${score}/100`;
    const options: NotificationOptions = {
      body: `Recomendación de hoy: ${recommendation}. Revisa tu panel para planificar la sesión.`,
      icon: '/Aerogym/icon-192.png',
      badge: '/Aerogym/icon-192.png',
      tag: 'daily-readiness',
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  }
}

export function scheduleWorkoutReminder(timeStr: string, routineName: string): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delayMs = scheduledTime.getTime() - now.getTime();

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      const title = '💪 AeroGym: ¡Hora de Entrenar!';
      const options: NotificationOptions = {
        body: `Tu rutina "${routineName}" está lista. ¡Supera tus marcas de hoy!`,
        icon: '/Aerogym/icon-192.png',
        badge: '/Aerogym/icon-192.png',
        tag: 'workout-reminder',
      };
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, options));
      } else {
        new Notification(title, options);
      }
    }
  }, delayMs);

  return true;
}
