import { Server as SocketIOServer, Socket } from 'socket.io';
import { RemoconConnectMessage, RemoconDisconnectMessage, RemoconConsoleMessage, RemoconClientConsoleMessage } from './interface/message';
import { RemoconProject } from './interface/project';
import { EventEmitter } from 'events';
import { createServer as createHttpServer, Server as HttpServer } from 'http';

const sockets: Record<string, Socket> = {};
const projects: Record<string, RemoconProject> = {};

class RemoconServer {
  emitter: EventEmitter;
  private httpServer: HttpServer;
  private io: SocketIOServer;
  constructor() {
    // init eventemitter
    this.emitter = new EventEmitter();
    // init http server
    this.httpServer = createHttpServer();
    // init socket.io
    const io = new SocketIOServer();
    io.on('connection', (socket: Socket) => {
      // add to record
      sockets[socket.id] = socket;
      // handle events
      socket.on('init', (project: RemoconProject) => {
        projects[socket.id] = project;
        const message: RemoconConnectMessage = {
          socket,
          project,
        };
        this.emitter.emit('connect', message);
      });
      socket.on('disconnect', (reason) => {
        const project = projects[socket.id];
        const message: RemoconDisconnectMessage = {
          project,
          socketId: socket.id,
          reason,
        };
        this.emitter.emit('disconnect', message);
        if (project) {
          delete projects[socket.id];
        }
        delete sockets[socket.id];
      });
      socket.on('console-message', (clientMsg: RemoconClientConsoleMessage) => {
        const message: RemoconConsoleMessage = {
          ...clientMsg,
          project: projects[socket.id],
        };
        this.emitter.emit('console-message', message);
      });
    });
    this.io = io;
  }
  async listen(port: number) {
    this.httpServer.listen(port);
  }
}

export default RemoconServer;
