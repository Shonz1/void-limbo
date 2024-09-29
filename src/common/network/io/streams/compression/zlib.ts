import { createDeflate, createInflate, deflateSync, inflateSync } from 'zlib';

import { MinecraftManualStream } from '../../../../../api';
import { getVarIntSize } from '../../utils';

export class ZlibCompressionStream extends MinecraftManualStream {
  baseStream?: MinecraftManualStream;

  private readonly compressionThreshold: number;

  constructor(compressionThreshold: number) {
    super();

    this.compressionThreshold = compressionThreshold;
  }

  async read() {
    if (this.baseStream instanceof MinecraftManualStream) {
      return this.readManual(this.baseStream);
    }

    throw new Error('Unknown stream type');
  }

  async write(chunk: Buffer) {
    if (this.baseStream instanceof MinecraftManualStream) {
      return this.writeManual(this.baseStream, chunk);
    }

    throw new Error('Unknown stream type');
  }

  private async readManual(stream: MinecraftManualStream) {
    const packetLength = await stream.readVarInt();
    const dataLength = await stream.readVarInt();

    if (dataLength === 0) {
      return stream.read(packetLength - 1);
    }

    const length = packetLength - getVarIntSize(dataLength);
    const buffer = await stream.read(length);

    const inflate = createInflate();
    inflate.write(buffer);
    inflate.flush();

    const uncompressed = inflateSync(buffer); // inflate.read(dataLength) ?? Buffer.alloc(0);

    if (uncompressed.length !== dataLength) {
      throw new Error(`Received dataLength is ${dataLength}, but uncompressed data length is ${inflate.readableLength}`);
    }

    return uncompressed as Buffer;
  }

  private async writeManual(stream: MinecraftManualStream, chunk: Buffer) {
    const dataLength = chunk.length < this.compressionThreshold ? 0 : chunk.length;

    if (dataLength > 0) {
      const deflate = createDeflate();
      deflate.write(chunk);
      deflate.flush();

      const compressed = deflateSync(chunk); // deflate.read();

      const packetLength = getVarIntSize(dataLength) + (compressed?.length || 0);
      stream.writeVarInt(packetLength);
      stream.writeVarInt(dataLength);
      stream.write(compressed);
    } else {
      const packetLength = getVarIntSize(dataLength) + chunk.length;

      stream.writeVarInt(packetLength);
      stream.writeVarInt(dataLength);
      stream.write(chunk);
    }
  }
}
