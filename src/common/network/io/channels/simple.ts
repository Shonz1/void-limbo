import { MinecraftChannel, MinecraftMessage, MinecraftStream, MinecraftStreamBase, Phase, Player, ProtocolVersion } from '../../../../api';
import { MinecraftOutboundPacket } from '../messages';
import { MinecraftPacketMessageStream } from '../streams';

export class SimpleChannel implements MinecraftChannel {
  head: MinecraftStream;

  private association: Player | null = null;
  private protocolVersion = ProtocolVersion.OLDEST;
  private phase = Phase.HANDSHAKE;

  constructor(head: MinecraftStreamBase) {
    this.head = head;
  }

  get closed(): boolean {
    return this.head.closed;
  }

  getAssociation(): Player | null {
    return this.association;
  }

  setAssociation(value: Player): void {
    this.association = value;
  }

  getProtocolVersion(): ProtocolVersion {
    return this.protocolVersion;
  }

  setProtocolVersion(value: ProtocolVersion): void {
    this.protocolVersion = value;
  }

  getPhase(): Phase {
    return this.phase;
  }

  setPhase(value: Phase): void {
    this.phase = value;
  }

  add(stream: MinecraftStream): void {
    stream.baseStream = this.head;
    this.head = stream;
  }

  addBefore(beforeType: new (...args: any[]) => MinecraftStream, stream: MinecraftStream): void {
    const before = this.get(beforeType);
    if (!before) {
      throw new Error('Stream not found');
    }

    stream.baseStream = before.baseStream;
    before.baseStream = stream;
  }

  get(streamType: new (...args: any[]) => MinecraftStream): MinecraftStream | null {
    let current = this.head;

    while (current) {
      if (current instanceof streamType) {
        return current;
      }

      current = (current as any).baseStream;
    }

    return null;
  }

  async readMessage(): Promise<MinecraftMessage> {
    if (this.head instanceof MinecraftPacketMessageStream) {
      return this.head.readPacket();
    }

    throw new Error('Unknown stream type');
  }

  writeMessage(message: MinecraftMessage): Promise<void> {
    if (this.head instanceof MinecraftPacketMessageStream) {
      return this.head.writePacket(message as MinecraftOutboundPacket);
    }

    throw new Error('Unknown stream type');
  }

  destroy(): void {
    this.head.destroy();
    this.association?.destroy();
  }
}
