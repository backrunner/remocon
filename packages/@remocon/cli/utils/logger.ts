import chalk from 'chalk';

export enum LogType {
  debug = 'debug',
  trace = 'trace',
  log = 'log',
  info = 'info',
  warn = 'warn',
  error = 'error',
  success = 'success',
}

const TYPE_PREFIX_MAP = {
  [LogType.debug]: chalk.grey('[Debug]'),
  [LogType.trace]: chalk.hex('#333')('[Trace]'),
  [LogType.log]: chalk.hex('#666')('[Log]'),
  [LogType.info]: chalk.blue('[Info]'),
  [LogType.warn]: chalk.yellow('[Yellow]'),
  [LogType.error]: chalk.red('[Error]'),
  [LogType.success]: chalk.green('[Success]'),
};

class Logger {
  outputLog({ type, args }: {
    type: LogType;
    args: unknown[];
  }) {
    const typePrefix = TYPE_PREFIX_MAP[type];
    args.unshift(typePrefix);
    // eslint-disable-next-line no-console
    console.log(...args);
  }
  debug(...args: unknown[]) {
    this.outputLog({
      type: LogType.debug,
      args,
    });
  }
  trace(...args: unknown[]) {
    this.outputLog({
      type: LogType.trace,
      args,
    });
  }
  log(...args: unknown[]) {
    this.outputLog({
      type: LogType.log,
      args,
    });
  }
  info(...args: unknown[]) {
    this.outputLog({
      type: LogType.info,
      args,
    });
  }
  warn(...args: unknown[]) {
    this.outputLog({
      type: LogType.warn,
      args,
    });
  }
  error(...args: unknown[]) {
    this.outputLog({
      type: LogType.error,
      args,
    });
  }
  success(...args: unknown[]) {
    this.outputLog({
      type: LogType.success,
      args,
    });
  }
}

export default new Logger();
