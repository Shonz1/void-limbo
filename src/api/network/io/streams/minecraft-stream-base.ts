export interface MinecraftStreamBase {
  readonly closed: boolean;

  destroy(): void;
}
