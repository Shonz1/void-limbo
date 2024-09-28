import { Connection } from './connection';
import { MinecraftStream } from './minecraft.stream';

export class MinecraftPacket {
  constructor(props = {}) {
    Object.assign(this, props);
  }

  async decode(stream: MinecraftStream): Promise<void> {
    throw new Error('Method not implemented. ' + stream);
  }
  async encode(stream: MinecraftStream): Promise<void> {
    throw new Error('Method not implemented. ' + stream);
  }

  getSize(): number {
    return 0;
  }

  async handle(connection: Connection): Promise<void> {
    throw new Error('Method not implemented. ' + connection);
  }
}
