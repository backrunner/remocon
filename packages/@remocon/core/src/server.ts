import { Server as SocketIOServer, ServerOptions as SocketIOServerOpts, Socket } from 'socket.io';
import { EventEmitter } from 'events';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer } from 'https';
import { nanoid } from 'nanoid';
import Koa from 'koa';
import KoaRouter from '@koa/router';
import {
  RemoconConnectMessage,
  RemoconDisconnectMessage,
  RemoconConsoleMessage,
  RemoconClientConsoleMessage,
  RemoconClientInitMessage,
  RemoconClientErrorMessage,
  RemoconErrorMessage,
} from './interface/message';
import { RemoconProject } from './interface/project';
import { cleanHttpsCerts, getHttpsCerts } from './utils/certs';

const sockets: Record<string, Socket> = {};
const projects: Record<string, RemoconProject> = {};

export interface RemoconServerOpts {
  https?: boolean;
  socketio?: SocketIOServerOpts;
}

interface HttpsCert {
  cert: string;
  key: string;
}

class RemoconServer {
  emitter: EventEmitter;

  private httpServer: HttpServer | HttpsServer;
  private koaApp: Koa;
  private koaRouter: KoaRouter;
  private io: SocketIOServer;
  private httpsCert: HttpsCert | undefined;

  public constructor(opts: RemoconServerOpts) {
    // init eventemitter
    this.emitter = new EventEmitter();
    // init koa
    this.koaApp = new Koa();
    this.koaRouter = new KoaRouter();
    this.koaApp.use(this.koaRouter.routes());
    // init http server
    if (!opts.https) {
      this.httpServer = createHttpServer(this.koaApp.callback());
    } else {
      this.httpsCert = getHttpsCerts();
      this.httpServer = createHttpsServer(
        {
          ...this.httpsCert,
        },
        this.koaApp.callback(),
      );
      // register ca download route
      this.koaRouter.get('/rootca', (ctx) => {
        const isCer = ctx.query.type === 'cer';
        ctx.attachment(`rootca.${isCer ? 'cer' : 'crt'}`);
        ctx.body = this.httpsCert?.cert;
      });
    }
    // init socket.io
    const io = new SocketIOServer(this.httpServer, {
      transports: ['websocket'],
      ...opts.socketio,
    });
    io.on('connection', (socket: Socket) => {
      // add to record
      sockets[socket.id] = socket;
      // handle events
      socket.on('init', (clientMsg: RemoconClientInitMessage) => {
        const { project } = clientMsg;
        projects[socket.id] = project;
        const message: RemoconConnectMessage = {
          socket,
          project: project || {
            name: `unknown-${nanoid(4)}`,
            version: 'unknown',
          },
          env: clientMsg.env,
        };
        // tell clietn server is ready
        socket.emit('ready');
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
      socket.on('client-error', (clientMsg: RemoconClientErrorMessage) => {
        const message: RemoconErrorMessage = {
          ...clientMsg,
          project: projects[socket.id],
        };
        this.emitter.emit('error-message', message);
      });
    });
    this.io = io;
  }

  // instance getter
  public getSocketIOInstance() {
    return this.io;
  }
  public getHttpServer() {
    return this.httpServer;
  }
  public getKoaInstance() {
    return {
      app: this.koaApp,
      router: this.koaRouter,
    };
  }

  // https certs related
  public getHttpCerts() {
    return this.httpsCert;
  }
  public cleanHttpsCerts() {
    cleanHttpsCerts();
    this.httpsCert = undefined;
  }
  public generateHttpsCerts() {
    this.httpsCert = getHttpsCerts();
  }

  // server action
  public close() {
    this.httpServer.close();
  }

  public async listen(port: number) {
    this.httpServer.listen(port);
  }
}

export default RemoconServer;
