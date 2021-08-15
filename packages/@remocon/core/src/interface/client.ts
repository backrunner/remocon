export interface RemoconScreenInfo {
  width: number;
  height: number;
}

export interface RemoconClientEnv {
  userAgent: string;
  url: string;
  lang?: string;
  cookie?: string;
  storage?: Record<string, unknown>;
  screen?: RemoconScreenInfo;
}
