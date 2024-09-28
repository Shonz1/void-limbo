import { eventManager } from '../event-manager';

import { GameProfile } from './game-profile';
import { MinecraftStream } from './minecraft.stream';
import { PacketOut, PacketOutType } from './packet-out';
import { Phase } from './phase';
import { ProtocolVersion } from './protocol-version';
import { getVarIntSize } from './utils';

export class Connection {
  private static nextId = 0;
  private static readonly connections: Set<Connection> = new Set();

  public readonly stream;

  private phase = Phase.HANDSHAKE;
  private protocolVersion = ProtocolVersion.ZERO;
  private remoteAddress = '';
  private remotePort = 0;
  private id = 0;

  private gameProfile: GameProfile | null = null;

  private positionAndRotation = { x: 0, y: 0, z: 0, pitch: 0, yaw: 0, onGround: false };
  private lastPositionAndRotationUpdate = 0;

  constructor(stream: MinecraftStream) {
    this.stream = stream;
  }

  static getConnections(): Set<Connection> {
    return new Set(this.connections);
  }

  static addConnection(connection: Connection): void {
    this.connections.add(connection);
  }

  static removeConnection(connection: Connection): void {
    this.connections.delete(connection);
  }

  getStream(): MinecraftStream {
    return this.stream;
  }

  getPhase(): Phase {
    return this.phase;
  }

  setPhase(value: Phase): void {
    this.phase = value;
    eventManager.fire('phase-changed', { connection: this, phase: value });
  }

  getProtocolVersion(): ProtocolVersion {
    return this.protocolVersion ?? ProtocolVersion.ZERO;
  }

  setProtocolVersion(value: ProtocolVersion): void {
    this.protocolVersion = value;
  }

  getRemoteAddress(): string {
    return this.remoteAddress;
  }

  setRemoteAddress(value: string): void {
    this.remoteAddress = value;
  }

  getRemotePort(): number {
    return this.remotePort;
  }

  setRemotePort(value: number): void {
    this.remotePort = value;
  }

  getId(): number {
    return this.id;
  }

  setId(): void {
    this.id = Connection.nextId++;
  }

  getGameProfile(): GameProfile | null {
    return this.gameProfile;
  }

  setGameProfile(value: GameProfile): void {
    this.gameProfile = value;
  }

  getPositionAndRotation(): { x: number; y: number; z: number } {
    return new Proxy(this.positionAndRotation, {
      set: (target, key, value) => {
        this.lastPositionAndRotationUpdate = Date.now();
        return Reflect.set(target, key, value);
      },
    });
  }

  getLastPositionAndRotationUpdate(): number {
    return this.lastPositionAndRotationUpdate;
  }

  destroy() {
    this.stream.close();
  }

  async send(packet: PacketOut) {
    const packetType = packet.constructor as PacketOutType;
    const packetId = packetType.id;
    if (packetId === null) {
      throw new Error(`Invalid packet ${packetType.name}`);
    }

    const packetSize = packet.getSize();

    this.stream.writeVarInt(packetSize + getVarIntSize(packetId));
    this.stream.writeVarInt(packetId);
    await packet.encode(this.stream);

    console.log(`[OUT] 0x${packetId.toString(16).padStart(2, '0')} in phase ${Phase[this.getPhase()]}`);
  }
}
