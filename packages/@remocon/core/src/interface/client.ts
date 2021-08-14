export interface RemoconClientEnv {
  userAgent: string;
  url: string;
  lang?: string;
  cookie?: string;
  storage?: Record<string, unknown>;
}

export interface RemoconConsoleMessage {
  type: string;
  args: Array<unknown>;
}
