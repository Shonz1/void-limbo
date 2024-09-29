import { MinecraftMessage } from '../../../../api';
import { SimpleMemoryStream } from '../streams';

export class MinecraftBinaryPacket implements MinecraftMessage {
  readonly id: number;
  readonly stream: SimpleMemoryStream;

  constructor(id: number, stream: SimpleMemoryStream) {
    this.id = id;
    this.stream = stream;
  }
}
