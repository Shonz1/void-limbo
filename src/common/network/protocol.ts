import assert from 'assert';

import { Direction, Phase, ProtocolVersion } from '../../api';

import { MinecraftInboundPacket, MinecraftOutboundPacket } from './io';

type PacketInType = new () => MinecraftInboundPacket;
type PacketOutType = new (...args: any[]) => MinecraftOutboundPacket;

const PROTOCOL_MAPPING = new Map<ProtocolVersion, Map<Direction, Map<Phase, Map<number, PacketInType | PacketOutType>>>>();
const PACKETS_TO_IGNORE = new Map<ProtocolVersion, Map<Phase, Set<number>>>();

export const getProtocolRegistry = (
  protocolVersion: ProtocolVersion,
): Map<Direction, Map<Phase, Map<number, PacketInType | PacketOutType>>> => {
  if (!PROTOCOL_MAPPING.has(protocolVersion)) {
    PROTOCOL_MAPPING.set(
      protocolVersion,
      new Map([
        [Direction.CLIENTBOUND, new Map()],
        [Direction.SERVERBOUND, new Map()],
      ]),
    );
  }

  const result = PROTOCOL_MAPPING.get(protocolVersion);
  assert(result);

  return result;
};

export const registerInPacket = (phase: Phase, protocolMappings: [ProtocolVersion, number, ProtocolVersion?][], packet: PacketInType) => {
  for (let i = 0; i < protocolMappings.length; i++) {
    const current = protocolMappings[i];
    const next = i + 1 < protocolMappings.length ? protocolMappings[i + 1] : current;

    const [from, id, lastSupported] = current;
    const to = from.compare(next[0]) === 0 ? lastSupported ?? ProtocolVersion.LATEST : next[0];

    if (from.compare(to) > 0) {
      throw new Error(`Next mapping version (${to.getVersion()}) should be lower than the current (${from.getVersion()})`);
    }

    const range = ProtocolVersion.range(from, to);

    for (const protocolVersion of range) {
      const protocolRegistry = getProtocolRegistry(protocolVersion);
      const inPackets = protocolRegistry.get(Direction.SERVERBOUND);
      assert(inPackets);

      if (!inPackets.has(phase)) {
        inPackets.set(phase, new Map());
      }

      const phasePackets = inPackets.get(phase);
      assert(phasePackets);

      phasePackets.set(id, packet);
    }
  }
};

export const registerOutPacket = (phase: Phase, protocolMappings: [ProtocolVersion, number][], packet: PacketInType) => {
  for (let i = 0; i < protocolMappings.length; i++) {
    const current = protocolMappings[i];
    const next = i + 1 < protocolMappings.length ? protocolMappings[i + 1] : current;

    const [from, id] = current;
    const to = current[0].compare(next[0]) === 0 ? ProtocolVersion.LATEST : next[0];

    if (from.compare(to) > 0) {
      throw new Error(`Next mapping version (${to.getVersion()}) should be lower than the current (${from.getVersion()})`);
    }

    const range = ProtocolVersion.range(from, to);

    for (const protocolVersion of range) {
      if (protocolVersion !== from && protocolVersion === next[0]) {
        continue;
      }

      const protocolRegistry = getProtocolRegistry(protocolVersion);
      const inPackets = protocolRegistry.get(Direction.CLIENTBOUND);
      assert(inPackets);

      if (!inPackets.has(phase)) {
        inPackets.set(phase, new Map());
      }

      const phasePackets = inPackets.get(phase);
      assert(phasePackets);

      phasePackets.set(id, packet);
    }
  }
};

export const getInPacket = (protocolVersion: ProtocolVersion, phase: Phase, id: number): PacketInType =>
  PROTOCOL_MAPPING.get(protocolVersion)?.get(Direction.SERVERBOUND)?.get(phase)?.get(id) as PacketInType;

export const getOutPacketId = (protocolVersion: ProtocolVersion, phase: Phase, packet: PacketOutType) => {
  const protocolMapping = PROTOCOL_MAPPING.get(protocolVersion)?.get(Direction.CLIENTBOUND)?.get(phase);
  if (!protocolMapping) {
    return null;
  }

  return [...protocolMapping.entries()].find(([, type]) => type === packet)?.[0] ?? null;
};

export const ignorePacket = (protocolVersion: ProtocolVersion, phase: Phase, id: number) => {
  if (!PACKETS_TO_IGNORE.has(protocolVersion)) {
    PACKETS_TO_IGNORE.set(protocolVersion, new Map());
  }

  const phasePackets = PACKETS_TO_IGNORE.get(protocolVersion);
  assert(phasePackets);

  if (!phasePackets.has(phase)) {
    phasePackets.set(phase, new Set());
  }

  const ignoredPackets = phasePackets.get(phase);
  assert(ignoredPackets);

  ignoredPackets.add(id);
};

export const isPacketIgnored = (protocolVersion: ProtocolVersion, phase: Phase, id: number) =>
  !!PACKETS_TO_IGNORE.get(protocolVersion)?.get(phase)?.has(id);
