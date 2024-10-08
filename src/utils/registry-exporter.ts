import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';
import { readdir, writeFile } from 'fs/promises';
import net from 'net';
import { join } from 'path';

import { Phase, ProtocolVersion } from '../api';
import { getVarIntSize, SimpleMemoryStream, SimpleNetworkStream } from '../common';

const PROTOCOL_VERSION = ProtocolVersion.MINECRAFT_1_19_4.getVersion();

const writeHandshakePacket = async (stream: SimpleNetworkStream) => {
  const memoryStream = new SimpleMemoryStream();
  memoryStream.writeVarInt(0); // Handshake packet ID
  memoryStream.writeVarInt(PROTOCOL_VERSION); // Protocol version
  memoryStream.writeString('localhost'); // Server address
  memoryStream.writeShort(25565); // Server port
  memoryStream.writeVarInt(2); // Next state

  const size = memoryStream.baseStream.readableLength;

  stream.writeVarInt(size);
  await stream.write(await memoryStream.read(size));
};

const writeLoginStartPacket = async (stream: SimpleNetworkStream) => {
  const memoryStream = new SimpleMemoryStream();
  memoryStream.writeVarInt(0); // Login packet ID
  memoryStream.writeString('exporter'); // Username

  memoryStream.writeBoolean(true);
  memoryStream.writeUuid(randomBytes(16).toString('hex')); // UUID

  const size = memoryStream.baseStream.readableLength;

  stream.writeVarInt(size);
  await stream.write(await memoryStream.read(size));
};

// const writeLoginAcknowledgePacket = async (stream: SimpleNetworkStream) => {
//   const memoryStream = new SimpleMemoryStream();
//   memoryStream.writeVarInt(3); // Login packet ID

//   const size = memoryStream.baseStream.readableLength;

//   stream.writeVarInt(size);
//   await stream.write(await memoryStream.read(size));
// };

// const writeKnownPacksResponsePacket = async (stream: SimpleNetworkStream) => {
//   const memoryStream = new SimpleMemoryStream();
//   memoryStream.writeVarInt(0x07); // Packet ID
//   memoryStream.writeVarInt(0); // Size

//   const size = memoryStream.baseStream.readableLength;

//   stream.writeVarInt(size);
//   await stream.write(await memoryStream.read(size));
// };

(async () => {
  const socket = new net.Socket();

  socket.connect(25565, 'localhost', async () => {
    console.log('Connected to server');

    const stream = new SimpleNetworkStream(socket);

    let phase = Phase.HANDSHAKE;

    await writeHandshakePacket(stream);
    await writeLoginStartPacket(stream);

    phase = Phase.LOGIN;

    while (!socket.closed) {
      const packetLength = await stream.readVarInt();
      const packetId = await stream.readVarInt();

      console.log('Phase:', Phase[phase], '|', 'Packet ID:', packetId);

      if (phase === Phase.LOGIN) {
        if (packetId === 0x00) {
          console.error(await stream.readString());
          stream.destroy();
          return;
        }

        if (packetId === 0x02) {
          await stream.read(packetLength - getVarIntSize(packetId));

          // await writeLoginAcknowledgePacket(stream);
          phase = Phase.PLAY;
        }
      }
      //  else if (phase === Phase.CONFIGURATION) {
      //   if (packetId === 0x05) {
      //     // Registry data
      //     const buffer = await stream.read(packetLength - getVarIntSize(packetId));
      //     const path = join(process.cwd(), 'data', 'registries', PROTOCOL_VERSION.toString());
      //     await mkdirSync(path, { recursive: true });
      //     const files = await readdir(path);
      //     await writeFile(join(path, `${files.length}.dat`), buffer);
      //     continue;
      //   }

      //   if (packetId === 0x0e) {
      //     await writeKnownPacksResponsePacket(stream);
      //   }

      //   if (packetId === 0x02) {
      //     stream.destroy();
      //     return;
      //   }

      //   await stream.read(packetLength - getVarIntSize(packetId));
      // }
      else if (phase === Phase.PLAY) {
        if (packetId === 0x28) {
          await stream.readInt();
          await stream.readBoolean();
          await stream.readByte();
          await stream.readByte();

          const count = await stream.readVarInt();
          for (let i = 0; i < count; i++) {
            await stream.readString();
          }

          {
            // const a = Number(stream.baseStream?.readableLength) | 0;
            // await stream.readNamedCompound();
            // const b = Number(stream.baseStream?.readableLength) | 0;
            // console.log('Codec size:', a - b);
            // return;

            const codec = await stream.read(32769);
            const path = join(process.cwd(), 'data', 'registries', PROTOCOL_VERSION.toString());
            mkdirSync(path, { recursive: true });
            const files = await readdir(path);
            await writeFile(join(path, `${files.length}.dat`), codec);
          }

          {
            // const a = Number(stream.baseStream?.readableLength) | 0;
            // await stream.readNamedCompound();
            // const b = Number(stream.baseStream?.readableLength) | 0;
            // console.log('Codec size:', a - b);
            // return;
            // const codec = await stream.read(294);
            // const path = join(process.cwd(), 'data', 'registries', PROTOCOL_VERSION.toString());
            // mkdirSync(path, { recursive: true });
            // const files = await readdir(path);
            // await writeFile(join(path, `${files.length}.dat`), codec);
          }

          await stream.readString();
          await stream.readString();
          await stream.readLong();
          await stream.readVarInt();
          await stream.readVarInt();
          await stream.readVarInt();
          await stream.readBoolean();
          await stream.readBoolean();
          await stream.readBoolean();
          await stream.readBoolean();
          await stream.readBoolean();

          continue;
        }

        await stream.read(packetLength - getVarIntSize(packetId));
      }
    }
  });
})().catch(console.error);
