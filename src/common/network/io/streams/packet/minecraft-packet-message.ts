import {
  MinecraftChannel,
  MinecraftManualStream,
  MinecraftMessage,
  MinecraftStream,
  MinecraftStreamBase,
  Phase,
  eventManager,
} from '../../../../../api';
import { getInPacket, getOutPacketId } from '../../../protocol';
import { MinecraftBinaryPacket, MinecraftOutboundPacket } from '../../messages';
import { getVarIntSize } from '../../utils';
import { ZlibCompressionStream } from '../compression/zlib';
import { SimpleMemoryStream } from '../memory/simple-memory';

export class MinecraftPacketMessageStream implements MinecraftStream {
  readonly channel: MinecraftChannel;

  baseStream?: MinecraftStreamBase;

  constructor(channel: MinecraftChannel) {
    this.channel = channel;
  }

  get closed(): boolean {
    return this.baseStream?.closed ?? true;
  }

  destroy(): void {
    this.baseStream?.destroy();
  }

  async readPacket(): Promise<MinecraftMessage> {
    if (this.baseStream instanceof ZlibCompressionStream) {
      return this.decodeCompleted(this.baseStream);
    }

    if (this.baseStream instanceof MinecraftManualStream) {
      return this.decodeManual(this.baseStream);
    }

    throw new Error('Unknown stream type');
  }

  async writePacket(packet: MinecraftOutboundPacket): Promise<void> {
    if (this.baseStream instanceof ZlibCompressionStream) {
      return this.encodeCompleted(this.baseStream, packet);
    }

    if (this.baseStream instanceof MinecraftManualStream) {
      return this.encodeManual(this.baseStream, packet);
    }

    throw new Error('Unknown stream type');
  }

  private async decodeManual(stream: MinecraftManualStream): Promise<MinecraftMessage> {
    const packetSize = await stream.readVarInt();
    const packetId = await stream.readVarInt();

    const dataBuffer = await stream.read(packetSize - getVarIntSize(packetId));
    const dataSize = dataBuffer?.length || 0;
    const memoryStream = new SimpleMemoryStream(dataBuffer);

    console.log(`[IN] 0x${packetId.toString(16).padStart(2, '0')} in phase ${Phase[this.channel.getPhase()]}`);

    const packetType = getInPacket(this.channel.getProtocolVersion(), this.channel.getPhase(), packetId);
    if (!packetType) {
      await eventManager.fire('packet-received', {
        channel: this.channel,
        packetId,
        packet: null,
        getStream: () => new SimpleMemoryStream(dataBuffer),
        size: dataSize,
      });
      return new MinecraftBinaryPacket(packetId, memoryStream);
    }

    const packet = new packetType();

    await packet.decode(memoryStream, this.channel.getProtocolVersion(), dataSize);

    await eventManager.fire('packet-received', {
      channel: this.channel,
      packetId,
      packet,
      getStream: () => new SimpleMemoryStream(dataBuffer),
      size: dataSize,
    });

    memoryStream.destroy();

    return packet;
  }

  private async decodeCompleted(stream: ZlibCompressionStream): Promise<MinecraftMessage> {
    const data = await stream.read();

    const memoryStream = new SimpleMemoryStream(data);

    const packetId = await memoryStream.readVarInt();

    const dataSize = data.length - getVarIntSize(packetId);

    console.log(`[IN] 0x${packetId.toString(16).padStart(2, '0')} in phase ${Phase[this.channel.getPhase()]}`);

    const packetType = getInPacket(this.channel.getProtocolVersion(), this.channel.getPhase(), packetId);
    if (!packetType) {
      await eventManager.fire('packet-received', {
        channel: this.channel,
        packetId,
        packet: null,
        getStream: () => new SimpleMemoryStream(data),
        size: dataSize,
      });
      return new MinecraftBinaryPacket(packetId, memoryStream);
    }

    const packet = new packetType();

    await packet.decode(memoryStream, this.channel.getProtocolVersion(), dataSize);

    await eventManager.fire('packet-received', {
      channel: this.channel,
      packetId,
      packet,
      getStream: () => new SimpleMemoryStream(data),
      size: dataSize,
    });

    memoryStream.destroy();

    return packet;
  }

  private async encodeManual(stream: MinecraftManualStream, packet: MinecraftOutboundPacket): Promise<void> {
    const memoryStream = new SimpleMemoryStream();

    let packetId = null;

    if (packet instanceof MinecraftBinaryPacket) {
      packetId = packet.id;

      memoryStream.writeVarInt(packet.id);
      memoryStream.write(await packet.stream.read(packet.stream.baseStream?.readableLength ?? 0));
    } else {
      packetId = getOutPacketId(
        this.channel.getProtocolVersion(),
        this.channel.getPhase(),
        packet.constructor as new () => MinecraftOutboundPacket,
      );
      if (packetId === undefined || packetId === null) {
        throw new Error(`Unknown packet: ${packet.constructor.name}`);
      }

      await memoryStream.writeVarInt(packetId);

      await packet.encode(memoryStream, this.channel.getProtocolVersion());
    }

    if (packetId === null) {
      return;
    }

    const size = memoryStream.baseStream?.readableLength ?? 0;

    stream.writeVarInt(size);
    await stream.write(await memoryStream.read(size));

    console.log(`[OUT] 0x${packetId.toString(16).padStart(2, '0')} in phase ${Phase[this.channel.getPhase()]}`);

    memoryStream.destroy();
  }

  private async encodeCompleted(stream: ZlibCompressionStream, packet: MinecraftOutboundPacket): Promise<void> {
    const memoryStream = new SimpleMemoryStream();

    let packetId = null;

    if (packet instanceof MinecraftBinaryPacket) {
      packetId = packet.id;

      memoryStream.writeVarInt(packet.id);
      memoryStream.write(await packet.stream.read(packet.stream.baseStream?.readableLength ?? 0));
    } else {
      packetId = getOutPacketId(
        this.channel.getProtocolVersion(),
        this.channel.getPhase(),
        packet.constructor as new () => MinecraftOutboundPacket,
      );
      if (packetId === undefined || packetId === null) {
        throw new Error(`Unknown packet: ${packet.constructor.name}`);
      }

      await memoryStream.writeVarInt(packetId);

      await packet.encode(memoryStream, this.channel.getProtocolVersion());
    }

    if (packetId === null) {
      return;
    }

    const size = memoryStream.baseStream?.readableLength ?? 0;
    await stream.write(await memoryStream.read(size));

    console.log(`[OUT] 0x${packetId.toString(16).padStart(2, '0')} in phase ${Phase[this.channel.getPhase()]}`);

    memoryStream.destroy();
  }
}
