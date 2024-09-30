const deepEqual = (obj1: any, obj2: any) => {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

export const getBlockStateId = (blocksData: Record<string, any>, name: string, properties?: Record<string, unknown>) => {
  const blockData = blocksData[name] ?? {};

  if (!blockData.states) {
    console.warn(`Block ${name} has no states`);
    return 0;
  }

  const state = blockData.states.find((i: any) => deepEqual(i.properties, properties));
  const defaultState = blockData.states.find((i: any) => i.default);

  if (!state) {
    console.warn(`Block state ${name} ${JSON.stringify(properties)} not found`);
  }

  return state?.id ?? defaultState?.id ?? 0;
};

export const getBlockStateBitsPerEntity = (variantCount: number) => {
  const bitsPerEntity = Math.ceil(Math.log2(variantCount));

  if (bitsPerEntity === 0) {
    return variantCount;
  } else if (bitsPerEntity <= 4) {
    return 4;
  } else if (bitsPerEntity <= 8) {
    return bitsPerEntity;
  } else {
    return 0;
  }
};

export const getBiomeStateBitsPerEntity = (variantCount: number) => {
  const bitsPerEntity = Math.ceil(Math.log2(variantCount));

  if (bitsPerEntity <= 3) {
    return variantCount;
  } else {
    return 0;
  }
};
