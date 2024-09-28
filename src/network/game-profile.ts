export interface GameProfileProperty {
  name: string;
  value: string;
  signature?: string;
}

export interface GameProfileParams {
  uuid: string;
  name: string;
  properties: GameProfileProperty[];
}

export class GameProfile {
  readonly uuid: string;
  readonly name: string;
  readonly properties: GameProfileProperty[];

  constructor({ uuid, name, properties }: GameProfileParams) {
    this.uuid = uuid;
    this.name = name;
    this.properties = properties;
  }
}
