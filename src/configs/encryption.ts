import { generateKeyPairSync } from 'crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 1024 });

export const ONLINE_MODE = false;
export const PRIVATE_KEY = privateKey.export({ type: 'pkcs1', format: 'pem' });
export const PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'der' });
