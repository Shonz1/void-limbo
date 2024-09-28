import { Cipher, createCipheriv, createDecipheriv, Decipher } from 'node:crypto';

import { WrapperStream } from './wrapper.stream';

export class EncryptedStream extends WrapperStream {
  private readonly cipher: Cipher;
  private readonly decipher: Decipher;

  constructor(key: Buffer, stream: WrapperStream) {
    super(stream);

    this.cipher = createCipheriv('aes-128-cfb8', key, key);
    this.decipher = createDecipheriv('aes-128-cfb8', key, key);
  }

  read(size: number) {
    const buf = super.read(size);

    return buf ? this.decrypt(buf) : null;
  }

  write(chunk: Buffer, encoding?: BufferEncoding) {
    return super.write(this.encrypt(chunk), encoding);
  }

  private encrypt(buffer: Buffer) {
    return this.cipher.update(buffer);
  }

  private decrypt(buffer: Buffer) {
    if (!buffer) {
      return null;
    }

    return this.decipher.update(buffer);
  }
}
