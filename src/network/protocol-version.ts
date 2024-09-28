interface ProtocolVersionParams {
  version: number;
  names: string[];
}

export class ProtocolVersion {
  static readonly mapping = new Map<number, ProtocolVersion>();

  static readonly ZERO = new ProtocolVersion({ version: 0, names: [] });

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

  static get latest() {
    return ProtocolVersion.mapping.get(Math.max(...ProtocolVersion.mapping.keys())) ?? null;
  }

  static get oldest() {
    return ProtocolVersion.mapping.get(Math.min(...ProtocolVersion.mapping.keys())) ?? null;
  }

  static get(version: number) {
    return ProtocolVersion.mapping.get(version) ?? null;
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
