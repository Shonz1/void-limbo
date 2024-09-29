import * as _api from '../src/api';
import * as _common from '../src/common';
import * as _configs from '../src/configs';
import * as _nbt from '../src/nbt';
import * as _network from '../src/network';

declare global {
  declare const network: typeof _network;
  declare const nbt: typeof _nbt;
  declare const configs: typeof _configs;
  declare const api: typeof _api;
  declare const common: typeof _common;
}

export { _api as api, _common as common, _configs as configs, _nbt as nbt, _network as network };
