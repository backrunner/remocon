/* eslint-disable no-console */
import { RemoconClientConsoleMessage, RemoconClientErrorMessage, RemoconClientInitMessage, RemoconProject } from '@remocon/core';
import { io, Socket } from 'socket.io-client';
import { getClientEnv } from './utils/env';

interface RemoconClientOpts {
  name?: string;
  host: string;
  port?: number;
  project?: RemoconProject;
  https: boolean;
  overwriteConsole: boolean;
  errorCapture: boolean;
}

enum RemoconClientCacheType {
  console = 1,
  error = 2,
}

interface RemoconClientCache {
  type: RemoconClientCacheType,
  message: RemoconClientConsoleMessage | RemoconClientErrorMessage;
}

class RemoconClient {
  private url: string;
  private io: Socket;
  private project: RemoconProject;
  private inited: boolean;
  private cacheQueue: RemoconClientCache[];
  constructor(userOpts: RemoconClientOpts) {
    // init options
    const opts: RemoconClientOpts = {
      host: '',
      https: false,
      overwriteConsole: true,
      errorCapture: true,
    };
    Object.assign(opts, userOpts);
    if (opts.name && !opts.project) {
      opts.project = {
        name: opts.name,
        version: 'unknown',
      };
    }
    if (!opts.host.includes(':') && opts.port) {
      opts.host = `${opts.host}:${opts.port}`;
    }
    // init properties
    this.url = `${opts.https ? 'wss://' : 'ws：//'}${opts.host}/`;
    this.project = opts.project;
    this.inited = false;
    this.cacheQueue = [];
    // create socket.io client
    this.io = io(this.url, {
      transports: ['websocket'],
    });
    // overwrite console methods
    if (opts.overwriteConsole) {
      const types = ['log', 'info', 'warn', 'error'];
      types.forEach((type: string) => {
        this.overwriteConsole(type);
      });
    }
    // global error capture
    if (opts.errorCapture) {
      window.addEventListener('error', (e) => {
        this.reportError({
          type: 'uncaught',
          error: {
            message: e.message,
            lineno: e.lineno,
            colno: e.colno,
            filename: e.filename,
          },
        });
      });
      window.addEventListener('unhandledrejection', (e) => {
        this.reportError({
          type: 'promiseRejection',
          error: {
            message: e.reason,
          },
        });
      });
    }
    // socket events
    this.io.on('connect', () => {
      this.init();
    });
    this.io.on("connect_error", () => {
      setTimeout(() => {
        this.io.connect();
      }, 1000);
    });
    this.io.on('disconnect', () => {
      this.inited = false;
    });
    this.io.on('ready', () => {
      this.inited = true;
      // send all cached msg
      this.sendAllCached();
    });
  }
  send(type: string, args: unknown[]) {
    const message: RemoconClientConsoleMessage = {
      type,
      args,
    };
    if (!this.inited) {
      this.cacheQueue.push({
        type: RemoconClientCacheType.console,
        message,
      });
      return;
    }
    this.io.emit('console-message', message);
  }
  sendAllCached() {
    while(this.cacheQueue.length) {
      const cachedMsg = this.cacheQueue.shift();
      if (cachedMsg.type === RemoconClientCacheType.console) {
        this.io.emit('console-message', cachedMsg.message);
      } else if (cachedMsg.type === RemoconClientCacheType.error) {
        this.io.emit('client-error', cachedMsg.message);
      }
    }
  }
  debug(...args: unknown[]) {
    this.send('debug', args);
  }
  trace(...args: unknown[]) {
    this.send('trace', args);
  }
  log(...args: unknown[]) {
    this.send('log', args);
  }
  info(...args: unknown[]) {
    this.send('info', args);
  }
  warn(...args: unknown[]) {
    this.send('warn', args);
  }
  error(...args: unknown[]) {
    this.send('error', args);
  }
  success(...args: unknown[]) {
    this.send('success', args);
  }
  reportError(message: RemoconClientErrorMessage) {
    this.io.emit('client-error', message);
  }
  private init() {
    if (this.inited) {
      return;
    }
    const message: RemoconClientInitMessage = {
      project: this.project,
      env: getClientEnv(),
    }
    this.io.emit('init', message);
  }
  private overwriteConsole(type: string) {
    const originFn = console[type];
    console[type] = (...args: unknown[]) => {
      this[type](...args);
      originFn.call(console, ...args);
    }
  }
}

declare global {
  interface Window {
    Remocon: typeof RemoconClient;
  }
}

if (!window.Remocon) {
  window.Remocon = RemoconClient;
}

export default RemoconClient;
