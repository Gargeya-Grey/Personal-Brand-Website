import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';

function keyBytes(): Buffer {
  const raw = process.env.X_TOKEN_ENCRYPTION_KEY || '';
  if (!raw || raw.length < 16) {
    throw new Error(
      'X_TOKEN_ENCRYPTION_KEY is missing or too short. Set a long random secret (32+ chars) in env.'
    );
  }
  // Derive a stable 32-byte key from whatever the user set
  return createHash('sha256').update(raw).digest();
}

/** Encrypt plaintext → base64(iv:tag:ciphertext) */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

/** Decrypt base64(iv:tag:ciphertext) → plaintext */
export function decryptSecret(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  if (buf.length < 28) throw new Error('Invalid encrypted payload');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv(ALGO, keyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export function isTokenEncryptionConfigured(): boolean {
  const raw = process.env.X_TOKEN_ENCRYPTION_KEY || '';
  return raw.length >= 16;
}
