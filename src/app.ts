import fsp from 'node:fs/promises';
import net from 'node:net';
import { join } from 'node:path';

import * as configs from './configs';
import { eventManager, EventPriority } from './event-manager';
import * as nbt from './nbt';
import * as network from './network';
import { WrapperStream } from './network/streams/wrapper.stream';
import { NODE_CONTEXT, createContext, readScript } from './utils/vm';

(async () => {
  const pluginsPath = join(process.cwd(), 'plugins');
  const plugins = await fsp.readdir(pluginsPath);

  for (const pluginName of plugins) {
    const pluginPath = join(pluginsPath, pluginName);
    const pluginEntrypointPath = join(pluginPath, 'index.js');

    if (
      !(await fsp.access(pluginEntrypointPath).then(
        () => true,
        () => false,
      ))
    ) {
      continue;
    }

    await readScript(pluginEntrypointPath, {
      context: createContext(Object.freeze({ ...NODE_CONTEXT, network, nbt, eventManager, EventPriority, configs })),
    });
  }

  const server = net.createServer(async socket => {
    const stream = new network.MinecraftStream(new WrapperStream(socket));
    const connection = new network.Connection(stream);

    network.Connection.addConnection(connection);

    socket.once('error', err => {
      console.error(err);
    });

    socket.once('close', () => {
      eventManager.fire('connection-closed', { connection });
      network.Connection.removeConnection(connection);
      connection.destroy();
    });

    await eventManager.fire('connection-created', { connection }).catch(() => connection.destroy());
  });

  server.listen(25565, () => {
    console.log('Listening on port 25565');
  });
})();

// (async () => {
//   const readPath = join(process.cwd(), '/data/codec_1_20.nbt');
//   const writePath = join(process.cwd(), '/data/codec_1_20.dat');
//   const readStream = createReadStream(readPath);
//   const writeStream = createWriteStream(writePath);

//   const reader = new nbt.Reader(readStream, nbt.Endian.LITTLE_ENDIAN);
//   const writer = new nbt.Writer(writeStream, nbt.Endian.BIG_ENDIAN);
//   const codec = await reader.decodeNamedAsync();
//   writer.encode(codec);

//   readStream.close();
//   writeStream.close();
// })();

// (async () => {
//   try {
//     const readPath = join(process.cwd(), '/data/765/codec.dat.back');
//     const writePath = join(process.cwd(), '/data/765/codec.dat');
//     const readStream = createReadStream(readPath);
//     const writeStream = createWriteStream(writePath);

//     const reader = new nbt.Reader(readStream);
//     const writer = new nbt.Writer(writeStream);
//     const codec = (await reader.decodeAsync()) as any;

//     const overworld = codec['minecraft:dimension_type'].value.find((i: any) => i.name === 'minecraft:overworld');
//     if (overworld) {
//       overworld.element.height = new Int(24 * 16);
//       overworld.element.logical_height = new Int(24 * 16);
//       overworld.element.min_y = new Int(-64);
//     }

//     writer.encode(codec);

//     readStream.close();
//     writeStream.close();
//   } catch (e) {
//     console.error(e);
//   }
// })();

// (async () => {
//   const readPath = join(process.cwd(), '/data/map.litematic');
//   const readStream = createReadStream(readPath);
//   const zlib = createGunzip();
//   readStream.pipe(zlib);

//   const reader = new nbt.Reader(zlib);
//   const codec = await reader.decodeNamedAsync();

//   console.log(inspect(codec, false, 10, true));
// })();

// (async () => {
//   const regionFile = new RegionFile(join(process.cwd(), '/data/map/Lobby/region/r.0.0.mca'));

//   await regionFile.read();

//   const chunkStream = await regionFile.getChunkDataStream(0, 0);
//   if (!chunkStream) {
//     return;
//   }

//   const reader = new nbt.Reader(chunkStream);

//   console.log(await reader.decodeNamedAsync());
// })();
