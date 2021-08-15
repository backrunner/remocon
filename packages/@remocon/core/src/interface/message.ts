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
