import { Socket } from 'socket.io';
import { RemoconClientEnv } from './client';
import { RemoconProject } from './project';

export interface RemoconClientInitMessage {
  project: RemoconProject;
  env?: RemoconClientEnv;
}

export interface RemoconConnectMessage {
  project: RemoconProject;
  socket: Socket;
  env?: RemoconClientEnv;
}

export interface RemoconDisconnectMessage {
  project: RemoconProject;
  socketId: string;
  reason: string;
}

export interface RemoconClientConsoleMessage {
  type: string;
  args: unknown[];
}

export interface RemoconConsoleMessage {
  type: string;
  project: RemoconProject;
  args: unknown[];
}

export interface ClientUncaughtError {
  message: string;
  lineno: number;
  colno: number;
  filename: string;
}

export interface UnhandledPromiseRejection {
  message: string;
}

export interface RemoconClientErrorMessage {
  type: string;
  error: ClientUncaughtError | UnhandledPromiseRejection;
}

export interface RemoconErrorMessage {
  type: string;
  project: RemoconProject;
  error: ClientUncaughtError | UnhandledPromiseRejection;
}
