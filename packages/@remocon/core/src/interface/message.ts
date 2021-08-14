import { Socket } from 'socket.io';
import { RemoconProject } from './project';

export interface RemoconConnectMessage {
  project: RemoconProject;
  socket: Socket;
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
