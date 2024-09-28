import { generateKeyPairSync } from 'node:crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 1024 });

export const PRIVATE_KEY = privateKey.export({ type: 'pkcs1', format: 'pem' });
export const PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'der' });
