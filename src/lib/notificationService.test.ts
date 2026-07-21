import { describe, it, expect, vi } from 'vitest';
import { requestNotificationPermission, sendRestTimerNotification } from './notificationService';

describe('notificationService', () => {
  it('handles environment without Notification support gracefully', async () => {
    const hasPermission = await requestNotificationPermission();
    expect(hasPermission).toBe(false);
  });

  it('handles sendRestTimerNotification without error when unsupported', async () => {
    await expect(sendRestTimerNotification('Press de Banca', 90)).resolves.not.toThrow();
  });
});
