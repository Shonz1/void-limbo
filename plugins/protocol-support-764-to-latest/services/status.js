/// <reference path='../../global.d.ts' />

const { S2CPingResponsePacket } = require('../packets/outbound/status/ping-response');
const { S2CStatusResponsePacket } = require('../packets/outbound/status/status-response');

class StatusService {
  constructor() {
    api.eventManager.subscribe('phase-changed', event => this.onPhaseChanged(event));
  }

  async onPhaseChanged(event) {
    const { channel, phase } = event;

    if (phase !== api.Phase.STATUS) {
      return;
    }

    const protocolVersion = channel.getProtocolVersion();
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_2) < 0) {
      return;
    }

    await channel.readMessage(); // Status request
    await channel.writeMessage(
      new S2CStatusResponsePacket({
        response: JSON.stringify({
          version: {
            name: protocolVersion.getNames().at(-1),
            protocol: protocolVersion.getVersion(),
          },
          players: { max: 100, online: 0 },
          description: { text: 'Void Limbo' },
        }),
      }),
    );

    const pingPacket = await channel.readMessage();
    await channel.writeMessage(new S2CPingResponsePacket({ payload: pingPacket.payload }));
  }
}

module.exports = { StatusService };
