import { Cipher, createCipheriv, createDecipheriv, Decipher } from 'crypto';

import { MinecraftManualStream } from '../../../../../api';

export class AesCfb8EncryptionStream extends MinecraftManualStream {
  baseStream?: MinecraftManualStream;

  private readonly cipher: Cipher;
  private readonly decipher: Decipher;

  constructor(key: Buffer) {
    super();

    this.cipher = createCipheriv('aes-128-cfb8', key, key);
    this.decipher = createDecipheriv('aes-128-cfb8', key, key);
  }

  async read(size: number) {
    const buf = await this.baseStream?.read(size);

    return buf ? this.decrypt(buf) : Buffer.alloc(0);
  }

  write(chunk: Buffer) {
    return this.baseStream?.write(this.encrypt(chunk));
  }

  private encrypt(buffer: Buffer) {
    return this.cipher.update(buffer);
  }

  private decrypt(buffer: Buffer) {
    return this.decipher.update(buffer);
  }
}
