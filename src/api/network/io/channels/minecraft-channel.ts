import { Player } from '../../../players';
import { Phase } from '../../phase';
import { ProtocolVersion } from '../../protocol';
import { MinecraftMessage } from '../messages';
import { MinecraftStream, MinecraftStreamBase } from '../streams';

export interface MinecraftChannel {
  readonly head: MinecraftStreamBase;
  readonly closed: boolean;

  getRemoteAddress(): string;
  setRemoteAddress(value: string): void;

  getRemotePort(): number;
  setRemotePort(value: number): void;

  getProtocolVersion(): ProtocolVersion;
  setProtocolVersion(value: ProtocolVersion): void;

  getPhase(): Phase;
  setPhase(value: Phase): void;

  getAssociation(): Player | null;
  setAssociation(value: Player): void;

  add(stream: MinecraftStream): void;
  addBefore(beforeType: new (...args: any[]) => MinecraftStream, stream: MinecraftStream): void;

  get(streamType: new (...args: any[]) => MinecraftStream): MinecraftStream | null;

  readMessage(): Promise<MinecraftMessage>;
  writeMessage(message: MinecraftMessage): Promise<void>;

  destroy(): void;
}
