/* eslint-disable no-console */
import type { RemoconClientConsoleMessage, RemoconClientInitMessage, RemoconProject } from '@remocon/core';
import { io, Socket } from 'socket.io-client';
import { getClientEnv } from './utils/env';

interface RemoconClientOpts {
  host: string;
  project: RemoconProject;
  https: boolean;
  overwriteConsole: boolean;
}

class RemoconClient {
  private url: string;
  private io: Socket;
  private project: RemoconProject;
  private inited: boolean;
  private cacheQueue: RemoconClientConsoleMessage[];
  constructor(opts: RemoconClientOpts) {
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
      while(this.cacheQueue.length) {
        const cachedMsg = this.cacheQueue.shift();
        this.io.emit('console-message', cachedMsg);
      }
    });
  }
  send(type: string, args: unknown[]) {
    const message: RemoconClientConsoleMessage = {
      type,
      args,
    };
    if (!this.inited) {
      this.cacheQueue.push(message);
      return;
    }
    this.io.emit('console-message', message);
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
