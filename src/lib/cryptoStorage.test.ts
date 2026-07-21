import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from './cryptoStorage';

describe('cryptoStorage', () => {
  it('encrypts and decrypts payload correctly', async () => {
    const payload = { weight_kg: 82.5, body_fat_pct: 14.2 };
    const secret = 'user-secret-pass-123';

    const encrypted = await encryptData(payload, secret);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toContain('82.5');

    const decrypted = await decryptData<typeof payload>(encrypted, secret);
    expect(decrypted).toEqual(payload);
  });

  it('returns null when decrypting with wrong secret', async () => {
    const payload = { secret_note: 'Confidencial' };
    const encrypted = await encryptData(payload, 'correct-key');

    const decrypted = await decryptData(encrypted, 'wrong-key');
    expect(decrypted).toBeNull();
  });
});
