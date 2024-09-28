import * as _configs from '../src/configs';
import { EventManager, EventPriority as _EventPriority } from '../src/event-manager';
import * as _nbt from '../src/nbt';
import * as _network from '../src/network';

declare global {
  declare const network: typeof _network;
  declare const nbt: typeof _nbt;
  declare const configs: typeof _configs;
  declare const eventManager: EventManager;
  declare const EventPriority: typeof _EventPriority;
}
