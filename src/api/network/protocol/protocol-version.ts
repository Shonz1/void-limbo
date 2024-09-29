interface ProtocolVersionParams {
  version: number;
  names: string[];
}

export class ProtocolVersion {
  static readonly mapping = new Map<number, ProtocolVersion>();

  static readonly MINECRAFT_1_7_2 = new ProtocolVersion({ version: 4, names: ['1.7.2', '1.7.3', '1.7.4', '1.7.5'] });
  static readonly MINECRAFT_1_7_6 = new ProtocolVersion({ version: 5, names: ['1.7.6', '1.7.7', '1.7.8', '1.7.9', '1.7.10'] });
  static readonly MINECRAFT_1_8 = new ProtocolVersion({
    version: 47,
    names: ['1.8', '1.8.1', '1.8.2', '1.8.3', '1.8.4', '1.8.5', '1.8.6', '1.8.7', '1.8.8', '1.8.9'],
  });
  static readonly MINECRAFT_1_9 = new ProtocolVersion({ version: 107, names: ['1.9'] });
  static readonly MINECRAFT_1_9_1 = new ProtocolVersion({ version: 108, names: ['1.9.1'] });
  static readonly MINECRAFT_1_9_2 = new ProtocolVersion({ version: 109, names: ['1.9.2'] });
  static readonly MINECRAFT_1_9_4 = new ProtocolVersion({ version: 110, names: ['1.9.3', '1.9.4'] });
  static readonly MINECRAFT_1_10 = new ProtocolVersion({ version: 210, names: ['1.10', '1.10.1', '1.10.2'] });
  static readonly MINECRAFT_1_11 = new ProtocolVersion({ version: 315, names: ['1.11'] });
  static readonly MINECRAFT_1_11_1 = new ProtocolVersion({ version: 316, names: ['1.11.1', '1.11.2'] });
  static readonly MINECRAFT_1_12 = new ProtocolVersion({ version: 335, names: ['1.12'] });
  static readonly MINECRAFT_1_12_1 = new ProtocolVersion({ version: 338, names: ['1.12.1'] });
  static readonly MINECRAFT_1_12_2 = new ProtocolVersion({ version: 340, names: ['1.12.2'] });
  static readonly MINECRAFT_1_13 = new ProtocolVersion({ version: 393, names: ['1.13'] });
  static readonly MINECRAFT_1_13_1 = new ProtocolVersion({ version: 401, names: ['1.13.1'] });
  static readonly MINECRAFT_1_13_2 = new ProtocolVersion({ version: 404, names: ['1.13.2'] });
  static readonly MINECRAFT_1_14 = new ProtocolVersion({ version: 477, names: ['1.14'] });
  static readonly MINECRAFT_1_14_1 = new ProtocolVersion({ version: 480, names: ['1.14.1'] });
  static readonly MINECRAFT_1_14_2 = new ProtocolVersion({ version: 485, names: ['1.14.2'] });
  static readonly MINECRAFT_1_14_3 = new ProtocolVersion({ version: 490, names: ['1.14.3'] });
  static readonly MINECRAFT_1_14_4 = new ProtocolVersion({ version: 498, names: ['1.14.4'] });
  static readonly MINECRAFT_1_15 = new ProtocolVersion({ version: 573, names: ['1.15'] });
  static readonly MINECRAFT_1_15_1 = new ProtocolVersion({ version: 575, names: ['1.15.1'] });
  static readonly MINECRAFT_1_15_2 = new ProtocolVersion({ version: 578, names: ['1.15.2'] });
  static readonly MINECRAFT_1_16 = new ProtocolVersion({ version: 735, names: ['1.16'] });
  static readonly MINECRAFT_1_16_1 = new ProtocolVersion({ version: 736, names: ['1.16.1'] });
  static readonly MINECRAFT_1_16_2 = new ProtocolVersion({ version: 751, names: ['1.16.2'] });
  static readonly MINECRAFT_1_16_3 = new ProtocolVersion({ version: 753, names: ['1.16.3'] });
  static readonly MINECRAFT_1_16_4 = new ProtocolVersion({ version: 754, names: ['1.16.4', '1.16.5'] });
  static readonly MINECRAFT_1_17 = new ProtocolVersion({ version: 755, names: ['1.17'] });
  static readonly MINECRAFT_1_17_1 = new ProtocolVersion({ version: 756, names: ['1.17.1'] });
  static readonly MINECRAFT_1_18 = new ProtocolVersion({ version: 757, names: ['1.18', '1.18.1'] });
  static readonly MINECRAFT_1_18_2 = new ProtocolVersion({ version: 758, names: ['1.18.2'] });
  static readonly MINECRAFT_1_19 = new ProtocolVersion({ version: 759, names: ['1.19'] });
  static readonly MINECRAFT_1_19_1 = new ProtocolVersion({ version: 760, names: ['1.19.1', '1.19.2'] });
  static readonly MINECRAFT_1_19_3 = new ProtocolVersion({ version: 761, names: ['1.19.3'] });
  static readonly MINECRAFT_1_19_4 = new ProtocolVersion({ version: 762, names: ['1.19.4'] });
  static readonly MINECRAFT_1_20 = new ProtocolVersion({ version: 763, names: ['1.20', '1.20.1'] });
  static readonly MINECRAFT_1_20_2 = new ProtocolVersion({ version: 764, names: ['1.20.2'] });
  static readonly MINECRAFT_1_20_3 = new ProtocolVersion({ version: 765, names: ['1.20.3', '1.20.4'] });
  static readonly MINECRAFT_1_20_5 = new ProtocolVersion({ version: 766, names: ['1.20.5', '1.20.6'] });
  static readonly MINECRAFT_1_21 = new ProtocolVersion({ version: 767, names: ['1.21'] });

  private version: number;
  private names: string[];

  constructor({ version, names }: ProtocolVersionParams) {
    this.version = version;
    this.names = names;

    if (ProtocolVersion.mapping.has(version)) {
      throw new Error(`Protocol version ${version} already registered`);
    }

    ProtocolVersion.mapping.set(version, this);
  }

  static get LATEST(): ProtocolVersion {
    return [...ProtocolVersion.mapping.values()].sort((a, b) => b.compare(a))[0];
  }

  static get OLDEST(): ProtocolVersion {
    return [...ProtocolVersion.mapping.values()].sort((a, b) => a.compare(b))[0];
  }

  static get(version: number) {
    return ProtocolVersion.mapping.get(version) ?? null;
  }

  static range(start: ProtocolVersion = ProtocolVersion.OLDEST, end: ProtocolVersion = ProtocolVersion.LATEST): ProtocolVersion[] {
    return [...ProtocolVersion.mapping.entries()].reduce(
      (acc, [version, protocolVersion]) => (version >= start.version && version <= end.version ? [...acc, protocolVersion] : acc),
      [] as ProtocolVersion[],
    );
  }

  getVersion() {
    return this.version;
  }

  getNames() {
    return [...this.names];
  }

  compare(other: ProtocolVersion) {
    return this.version - other.version;
  }
}
