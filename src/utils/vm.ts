'use strict';

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const RUN_OPTIONS = { timeout: 1000 };

const CONTEXT_OPTIONS = {
  codeGeneration: {
    strings: false,
    wasm: false,
  },
};

const DEFAULT = {
  AbortController,
  AbortSignal,
  Event,
  EventTarget,
  MessageChannel,
  MessageEvent,
  MessagePort,
  Buffer,
  Blob,
  FormData,
  Headers,
  Response,
  Request,
  ByteLengthQueuingStrategy,
  URL,
  URLSearchParams,
  TextDecoder,
  TextEncoder,
  TextDecoderStream,
  TextEncoderStream,
  WebAssembly,
  queueMicrotask,
  setTimeout,
  setImmediate,
  setInterval,
  clearTimeout,
  clearImmediate,
  clearInterval,
  BroadcastChannel,
  CompressionStream,
  DecompressionStream,
  CountQueuingStrategy,
  fetch,
};

const NODE = { global, console, process, require };

const EMPTY_CONTEXT = vm.createContext(Object.freeze({}), CONTEXT_OPTIONS);
const COMMON_CONTEXT = vm.createContext(Object.freeze({ ...DEFAULT }));
const NODE_CONTEXT = vm.createContext(Object.freeze({ ...DEFAULT, ...NODE }));

const createContext = (context?: any, preventEscape = false) => {
  if (context === undefined) {
    return EMPTY_CONTEXT;
  }
  const options = preventEscape ? { microtaskMode: 'afterEvaluate' } : {};
  return vm.createContext(context, { ...CONTEXT_OPTIONS, ...options } as vm.CreateContextOptions);
};

const SRC_BEFORE = '((exports, require, module, __filename, __dirname) => { ';
const SRC_AFTER = '\n});';
const wrapSource = (src: string) => SRC_BEFORE + src + SRC_AFTER;

const USE_STRICT = `'use strict';\n`;
const useStrict = (src: string) => (src.startsWith(USE_STRICT) ? '' : USE_STRICT);

const addExt = (name: string) => {
  if (name.toLocaleLowerCase().endsWith('.js')) {
    return name;
  }

  return name + '.js';
};

const internalRequire = require;

class MetaScript {
  static #cache: Record<string, MetaScript> = {};

  name: string;
  dirname: string;
  relative: string;
  script: vm.Script;
  context: vm.Context;
  exports: any;

  constructor(name: string, src: string, options: any = {}) {
    this.name = name;
    this.dirname = options.dirname || process.cwd();
    this.relative = options.relative || '.';
    const strict = useStrict(src);
    const code = wrapSource(src);
    const lineOffset = strict === '' ? -1 : -2;
    const scriptOptions = { filename: name, ...options, lineOffset };
    this.script = new vm.Script(strict + code, scriptOptions);
    this.context = options.context || createContext();
    const runOptions = { ...RUN_OPTIONS, ...options };
    const exports = this.script.runInContext(this.context, runOptions);
    this.exports = this.commonExports(exports);
  }

  commonExports(closure: (...args: any[]) => any) {
    const exports = {};
    const module = { exports };
    const require = this.createRequire();
    const __filename = this.name;
    const __dirname = path.dirname(__filename);
    closure(exports, require, module, __filename, __dirname);

    return module.exports || exports;
  }

  createRequire() {
    const { context, dirname } = this;
    const require = (module: string) => {
      let name = module;
      const npm = !name.includes('.');
      if (!npm) {
        name = path.join(dirname, name);

        if (fs.existsSync(name) && fs.statSync(name).isDirectory()) {
          name = path.join(name, 'index.js');
        }

        name = addExt(name);
      }

      const absolute = internalRequire.resolve(name);
      if (npm && absolute === name) {
        return internalRequire(name);
      }

      if (MetaScript.#cache[absolute]) {
        return MetaScript.#cache[absolute].exports;
      }

      const src = fs.readFileSync(absolute, 'utf8');
      const opt = { context, dirname: path.dirname(absolute) };
      const script = new MetaScript(name, src, opt);

      MetaScript.#cache[absolute] = script;

      return script.exports;
    };

    return require;
  }
}

const readScript = async (filePath: string, options?: any) => {
  let _path = filePath;
  const stat = await fsp.stat(_path).catch(() => null);
  if (stat?.isDirectory()) {
    _path = path.join(_path, 'index.js');
  }

  const src = await fsp.readFile(addExt(_path), 'utf8');
  if (!src) {
    throw new SyntaxError(`File ${_path} is empty`);
  }

  const name = options?.filename ? options.filename : path.basename(_path, '.js');
  const script = new MetaScript(name, src, { ...options, filename: name, dirname: path.dirname(_path) });

  return script;
};

export { createContext, MetaScript, EMPTY_CONTEXT, COMMON_CONTEXT, NODE_CONTEXT, readScript };
