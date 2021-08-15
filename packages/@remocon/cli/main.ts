/* eslint-disable no-console */
import commander from 'commander';
import portfinder from 'portfinder';
import RemoconServer, { RemoconConnectMessage, RemoconConsoleMessage, RemoconDisconnectMessage } from '@remocon/core';
import logger, { LogType } from './utils/logger';
import { name, version } from './package.json';
import { getIpList } from './utils';
import chalk from 'chalk';

const program = new commander.Command();

program.name(name);
program.version(version);

interface StartCommandOpts {
  port?: number;
  ssl: boolean;
}

// title
console.log(chalk.blue(`Remocon v${version}`));
console.log(chalk.grey('============================'));

program
  .command('start')
  .option('-p, --port <port>')
  .option('-s, --ssl')
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
    server.emitter.on('connect', (message: RemoconConnectMessage) => {
      logger.info(`新连接建立 [${message.socket.id}]`);
      logger.info(`项目信息: ${message.project.name} (${message.project.version})`);
    });
    server.emitter.on('disconnect', (message: RemoconDisconnectMessage) => {
      logger.warn(`连接已断开 [${message.project.name}] (${message.socketId}): ${message.reason}`);
    });
    server.emitter.on('console-message', (message: RemoconConsoleMessage) => {
      const { args } = message;
      const logType: LogType = message.type as LogType;
      args.unshift(`[${message.project.name}]`);
      logger.outputLog({
        type: logType,
        args
      });
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
    console.log(chalk.grey('============================\n'));
    server.listen(port);
  });

program.parse();
