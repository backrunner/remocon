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

program
  .command('start')
  .option('-p', '--port <port>', parseInt)
  .action(async (options) => {
    let port: number | undefined;
    if (options.port) {
      if (options.port <= 0 || options > 65535) {
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
    const server = new RemoconServer();
    // init server
    server.emitter.on('connect', (message: RemoconConnectMessage) => {
      logger.info(`新连接建立 [${message.socket.id}]`);
      logger.info(`项目信息: ${message.project.name} (${version})`);
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
    console.log(chalk.blue(`Remocon v${version}`));
    console.log(chalk.grey('============================'));
    console.log(chalk.green(`\n服务已启动并监听端口 [${port}]...`));
    console.log(chalk.green(`\n您可以通过以下 URL 连接 Remocon：\n\n${
      getIpList().reduce((res, item, index) => {
        if (index === 1) {
          return `${res}:${port}\n${item}:${port}\n`;
        }
        return `${res}${item}:${port}\n`;
      })
    }`));
    console.log(chalk.grey('============================\n'));
    server.listen(port);
  });

program.parse();