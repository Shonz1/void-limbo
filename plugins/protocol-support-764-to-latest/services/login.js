/// <reference path='../../global.d.ts' />

const crypto = require('crypto');

const { S2CDisconnectPacket } = require('../packets/outbound/login/disconnect');
const { S2CEncryptionRequestPacket } = require('../packets/outbound/login/encryption-request');
const { S2CLoginSuccessPacket } = require('../packets/outbound/login/login-success');
const { S2CSetCompressionPacket } = require('../packets/outbound/login/set-compression');

const twosComplement = data => {
  let carry = true;
  for (let i = data.length - 1; i >= 0; i--) {
    data[i] = ~data[i] & 0xff;
    if (carry) {
      carry = data[i] === 0xff;
      data[i]++;
    }
  }
  return data;
};

class LoginService {
  constructor() {
    api.eventManager.subscribe('phase-changed', event => this.onPhaseChanged(event));
  }

  async onPhaseChanged(event) {
    const { channel, phase } = event;

    if (phase !== api.Phase.LOGIN) {
      return;
    }

    const protocolVersion = channel.getProtocolVersion();
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_2) < 0) {
      return;
    }

    const loginStartPacket = await channel.readMessage();
    const gameProfile = new api.GameProfile({ uuid: loginStartPacket.playerUuid, name: loginStartPacket.playerName, properties: [] });
    channel.getAssociation().setGameProfile(gameProfile);

    if (configs.ONLINE_MODE) {
      await this.enableEncryption(channel);
    }

    if (configs.COMPRESSION_THRESHOLD >= 0) {
      await this.enableCompression(channel, configs.COMPRESSION_THRESHOLD);
    }

    await api.eventManager.fire('pre-login-complete', { channel });

    await channel.writeMessage(
      new S2CLoginSuccessPacket({ playerUuid: gameProfile.uuid, playerName: gameProfile.name, properties: gameProfile.properties }),
    );

    await channel.readMessage(); // Login acknowledged

    channel.setPhase(api.Phase.CONFIGURATION);
  }

  async disconnect(channel, reason) {
    await channel.writeMessage(new S2CDisconnectPacket({ reason: JSON.stringify(reason) }));
  }

  async enableEncryption(channel) {
    const player = channel.getAssociation();

    await channel.writeMessage(
      new S2CEncryptionRequestPacket({
        serverId: '',
        publicKey: configs.PUBLIC_KEY,
        verifyToken: crypto.randomBytes(4),
        shouldAuthenticate: true,
      }),
    );

    const encryptionResponsePacket = await channel.readMessage();

    const decryptedSecret = crypto.privateDecrypt(
      {
        key: configs.PRIVATE_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      encryptionResponsePacket.sharedSecret,
    );

    channel.addBefore(common.MinecraftPacketMessageStream, new common.AesCfb8EncryptionStream(decryptedSecret));

    let serverId = crypto
      .createHash('sha1')
      .update(Buffer.concat([decryptedSecret, configs.PUBLIC_KEY]))
      .digest();

    const isNegative = (serverId[0] & 0x80) === 0x80;
    if (isNegative) {
      serverId = twosComplement(Buffer.from(serverId));
    }

    let serverIdComplement = serverId.toString('hex').replace(/^0+/, '');
    if (isNegative) {
      serverIdComplement = '-' + serverIdComplement;
    }

    const response = await fetch(configs.HAS_JOINED_URL + `?username=${player.getGameProfile().name}&serverId=${serverIdComplement}`);
    if (response.status === 204) {
      await this.disconnect({ text: 'Offline player', color: 'red' });
      return;
    }

    const responseJson = await response.json();

    const gameProfile = new api.GameProfile({ uuid: responseJson.id, name: responseJson.name, properties: responseJson.properties });
    player.setGameProfile(gameProfile);
  }

  async enableCompression(channel, threshold) {
    await channel.writeMessage(new S2CSetCompressionPacket({ threshold }));
    channel.addBefore(common.MinecraftPacketMessageStream, new common.ZlibCompressionStream(threshold));
  }
}

module.exports = { LoginService };
