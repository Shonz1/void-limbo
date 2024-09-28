import { PassThrough } from 'stream';

import { Writer } from '../nbt';

export const getVarIntSize = (value: number): number => {
  let size = 1;

  while (value > 127) {
    value >>= 7;
    size++;
  }

  return size;
};

export const getNbtSize = (value: Record<string, unknown>): number => {
  const stream = new PassThrough();
  const writer = new Writer(stream);
  writer.encode(value);

  return stream.writableLength;
};
