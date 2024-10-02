import { MinecraftMessage } from '../../../../api';
import { SimpleMemoryStream } from '../streams';

export class MinecraftBinaryPacket implements MinecraftMessage {
  readonly id: number;
  readonly stream: SimpleMemoryStream;
  readonly __size: number;

  constructor(id: number, stream: SimpleMemoryStream) {
    this.id = id;
    this.stream = stream;
    this.__size = stream.baseStream.readableLength;
  }
}
