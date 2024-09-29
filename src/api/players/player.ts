import { MinecraftChannel } from '../network';

import { GameProfile } from './game-profile';

export class Player {
  private static nextId = 0;
  private static readonly players: Set<Player> = new Set();

  private readonly channel: MinecraftChannel;

  private id = 0;

  private gameProfile = new GameProfile({ uuid: '', name: '', properties: [] });

  private positionAndRotation = { x: 0, y: 0, z: 0, pitch: 0, yaw: 0, onGround: false };
  private lastPositionAndRotationUpdate = 0;

  constructor(channel: MinecraftChannel) {
    this.channel = channel;
  }

  static getPlayers(): Set<Player> {
    return new Set(Player.players);
  }

  getChannel(): MinecraftChannel {
    return this.channel;
  }

  getId(): number {
    return this.id;
  }

  initId() {
    if (this.id) {
      return;
    }

    this.id = Player.nextId++;

    Player.players.add(this);
  }

  getGameProfile(): GameProfile {
    return this.gameProfile;
  }

  setGameProfile(value: GameProfile): void {
    this.gameProfile = value;
  }

  getPositionAndRotation() {
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
    if (this.id) {
      Player.players.delete(this);
    }
  }
}
