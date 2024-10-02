/// <reference path='../../global.d.ts' />

const { readdir, readFile } = require('fs/promises');
const { join } = require('path');

const { C2SFinishConfigurationPacket } = require('../packets/inbound/configuration/finish-configuration');
const { S2CFinishConfigurationPacket } = require('../packets/outbound/configuration/finish-configuration');
const { S2CRegistryDataPacket } = require('../packets/outbound/configuration/registry-data');

class ConfigurationService {
  constructor() {
    api.eventManager.subscribe('phase-changed', event => this.onPhaseChanged(event));
  }

  async onPhaseChanged(event) {
    const { channel, phase } = event;

    if (phase !== api.Phase.CONFIGURATION) {
      return;
    }

    const protocolVersion = channel.getProtocolVersion();
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_2) < 0) {
      return;
    }

    await this.sendRegistries(channel);

    await channel.writeMessage(new S2CFinishConfigurationPacket());

    await this.waitForConfigurationAcknowledge(channel);

    channel.setPhase(api.Phase.PLAY);
  }

  async sendRegistries(channel) {
    const path = join(process.cwd(), 'data', 'registries', `${channel.getProtocolVersion().getVersion()}`);
    const registryFiles = await readdir(path);

    for (const registryFile of registryFiles) {
      await channel.writeMessage(new S2CRegistryDataPacket({ codec: await readFile(join(path, registryFile)) }));
    }
  }

  async waitForConfigurationAcknowledge(channel) {
    while (!((await channel.readMessage()) instanceof C2SFinishConfigurationPacket)) {}
  }
}

module.exports = { ConfigurationService };
