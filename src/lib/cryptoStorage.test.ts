import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, generateUserSalt } from './cryptoStorage';

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

  it('supports custom dynamic user salts', async () => {
    const payload = { steps: 10500 };
    const secret = 'user-pass';
    const customSalt = generateUserSalt();

    expect(customSalt).toBeTypeOf('string');
    expect(customSalt.length).toBeGreaterThan(10);

    const encrypted = await encryptData(payload, secret, customSalt);
    const decrypted = await decryptData<typeof payload>(encrypted, secret, customSalt);

    expect(decrypted).toEqual(payload);
  });

  it('returns null when decrypting with wrong secret', async () => {
    const payload = { secret_note: 'Confidencial' };
    const encrypted = await encryptData(payload, 'correct-key');

    const decrypted = await decryptData(encrypted, 'wrong-key');
    expect(decrypted).toBeNull();
  });
});

