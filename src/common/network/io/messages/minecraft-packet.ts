import { MinecraftMessage, MinecraftStream, ProtocolVersion } from '../../../../api';

export interface MinecraftOutboundPacket extends MinecraftMessage {
  encode(stream: MinecraftStream, protocolVersion: ProtocolVersion): Promise<void>;
  getSize(protocolVersion: ProtocolVersion): number;
}

export interface MinecraftInboundPacket {
  decode(stream: MinecraftStream, protocolVersion: ProtocolVersion, size: number): Promise<void>;
}
