import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { RemoconConsoleMessage } from './interface/client';
import { RemoconProject } from './interface/project';
import { EventEmitter } from 'events';
import portfinder from 'portfinder';

const sockets: Record<string, Socket> = {};
const projects: Record<string, RemoconProject> = {};

class RemoconServer {
  private io: Server;
  private emitter: EventEmitter;
  constructor() {
    // init eventemitter
    this.emitter = new EventEmitter();
    // init socket.io
    const io = new Server();
    io.engine.generateId = () => {
      return uuidv4();
    };
    io.on('connection', (socket: Socket) => {
      // add to record
      sockets[socket.id] = socket;
      // handle events
      socket.on('init', (project: RemoconProject) => {
        projects[socket.id] = project;
        this.emitter.emit('connect', {
          socket,
          project,
        });
      });
      socket.on('disconnect', (reason) => {
        const project = projects[socket.id];
        this.emitter.emit('disconnect', {
          project,
          reason,
        });
        if (project) {
          delete projects[socket.id];
        }
        delete sockets[socket.id];
      });
      socket.on('console-message', (message: RemoconConsoleMessage) => {
        this.emitter.emit('console-message', message);
      });
    });
    this.io = io;
  }
  async listen(port: number) {
    const portToListen = port || await portfinder.getPortPromise({
      port: 8600,
      stopPort: 8610,
    });
    this.io.listen(portToListen);
  }
}

export default RemoconServer;
