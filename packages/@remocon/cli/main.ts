/* eslint-disable no-console */
import commander from 'commander';
import portfinder from 'portfinder';
import RemoconServer, { ClientUncaughtError, RemoconConnectMessage, RemoconConsoleMessage, RemoconDisconnectMessage, RemoconErrorMessage, UnhandledPromiseRejection } from '@remocon/core';
import logger, { LogType } from './utils/logger';
import { name, version } from './package.json';
import { getIpList } from './utils';
import chalk from 'chalk';

const program = new commander.Command();

program.name(name);
program.version(version);

interface StartCommandOpts {
  port?: number;
  only?: string;  // 过滤项目
  ssl: boolean;
}

// title
console.log(chalk.blue(`Remocon v${version}`));
console.log(chalk.grey('============================'));

program
  .command('start')
  .option('-p, --port <port>')
  .option('-s, --ssl')
  .option('--only <projectId>')
  .action(async (options: StartCommandOpts) => {
    let port: number | undefined;
    if (options.port) {
      if (options.port <= 0 || options.port > 65535) {
        logger.error('端口号不合法，请检查后重试');
        return;
      }
      port = options.port;
    } else {
      port = await portfinder.getPortPromise({
        port: 8600,
        stopPort: 8610,
      });
    }
    if (!port) {
      logger.error('无法获取可用端口');
      return;
    }
    const server = new RemoconServer({
      https: options.ssl,
    });
    // init server
    const { only } = options;
    const hasOnly = !!(only?.trim());
    const isTheOnly = (message: RemoconConnectMessage | RemoconDisconnectMessage | RemoconConsoleMessage) => {
      const { project } = message;
      if (project) {
        const id = project.id || project.name;
        if (only === id) {
          return true;
        }
      }
      return false;
    }
    server.emitter.on('connect', (message: RemoconConnectMessage) => {
      if (hasOnly && !isTheOnly(message)) {
        return;
      }
      logger.info(`新连接建立：${message.project?.name || 'unknown'} (${message.project.version}) [${message.socket.id}]`);
    });
    server.emitter.on('disconnect', (message: RemoconDisconnectMessage) => {
      if (hasOnly && !isTheOnly(message)) {
        return;
      }
      logger.warn(`连接已断开：[${message.project?.name || 'unknown'}] (${message.socketId}): ${message.reason}`);
    });
    server.emitter.on('console-message', (message: RemoconConsoleMessage) => {
      if (hasOnly && !isTheOnly(message)) {
        return;
      }
      const { args } = message;
      const logType: LogType = message.type as LogType;
      args.unshift(`[${message.project?.name || 'unknown'}]`);
      logger.outputLog({
        type: logType,
        args
      });
    });
    server.emitter.on('error-message', (message: RemoconErrorMessage) => {
      if (message.type === 'uncaught') {
        const error = message.error as ClientUncaughtError;
        logger.outputLog({
          type: LogType.error,
          args: [
            `[${message.project?.name || 'unknown'}]`,
            `[Uncaught Error]`,
            `[${error.filename} ${error.lineno}:${error.colno}]`,
            error.message,
          ],
        });
      } else if (message.type === 'promiseRejection') {
        const error = message.error as UnhandledPromiseRejection;
        logger.outputLog({
          type: LogType.error,
          args: [
            `[${message.project?.name || 'unknown'}]`,
            `[Unhandled Promise Rejection]`,
            `[${error.message}]`,
            message.error,
          ],
        });
      }
    });
    // start
    console.log(chalk.green(`\n服务已启动并监听端口 [${port}]...`));
    console.log(chalk.green(`\n您可以通过以下地址连接 Remocon：\n\n${
      getIpList().reduce((res, item, index) => {
        if (index === 1) {
          return `${res}:${port}\n${item}:${port}\n`;
        }
        return `${res}${item}:${port}\n`;
      })
    }`));
    if (options.ssl) {
      console.log(chalk.grey('HTTPS 已启用，请在设备上访问 /rootca 下载调试用根证书\n'));
    }
    if (hasOnly) {
      console.log(chalk.gray(`您已设置仅接收来自项目 ${only} 的调试信息\n`));
    }
    console.log(chalk.grey('============================\n'));
    server.listen(port);
  });

program.parse();
