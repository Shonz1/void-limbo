import fsp from 'node:fs/promises';
import net from 'node:net';
import { join } from 'node:path';

import * as api from './api';
import * as common from './common';
import * as configs from './configs';
import * as nbt from './nbt';
import { NODE_CONTEXT, createContext, readScript } from './utils/vm';

(async () => {
  const pluginsPath = join(process.cwd(), 'plugins');
  const plugins = await fsp.readdir(pluginsPath);

  for (const pluginName of plugins) {
    if (pluginName.startsWith('.')) {
      continue;
    }

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
      context: createContext(Object.freeze({ ...NODE_CONTEXT, nbt, configs, api, common })),
    });
  }

  const server = net.createServer(async socket => {
    const stream = new common.SimpleNetworkStream(socket);
    const channel = new common.SimpleChannel(stream);
    const player = new api.Player(channel);
    channel.setAssociation(player);

    socket.once('error', err => {
      console.error(err);
    });

    socket.once('close', () => {
      api.eventManager.fire('connection-closed', { channel });
      channel.destroy();
    });

    api.eventManager.fire('connection-created', { channel }).catch(() => channel.destroy());
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
