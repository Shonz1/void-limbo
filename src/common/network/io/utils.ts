export const getVarIntSize = (value: number): number => {
  let size = 1;

  while (value > 127) {
    value >>= 7;
    size++;
  }

  return size;
};
