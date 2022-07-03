import path from 'path';
import fs from 'fs';
import { searchFilePath } from '../utils/files';
import { NameProvider } from '../types/provider';

interface LocalNameProvider extends NameProvider {
  watcher?: fs.FSWatcher;
}

const getProviderConfigPath = () => {
  const configuredEnvPath = process.env.PROVIDER_CONFIG_PATH;
  if (configuredEnvPath) {
    return configuredEnvPath;
  }
  // if not exists, search process.cwd() or current
  const envConfigPath = `remocon.names.${process.env.NODE_ENV}.json`;
  const defaultConfigPath = 'remocon.names.json';
  const cwdEnvConfigPath = path.resolve(process.cwd(), envConfigPath);
  const cwdDefaultConfigPath = path.resolve(process.cwd(), defaultConfigPath);
  const rootEnvConfigPath = path.resolve(__dirname, '../', envConfigPath);
  const rootDefaultConfigPath = path.resolve(__dirname, '../', defaultConfigPath);
  // search existed one
  return searchFilePath([
    cwdEnvConfigPath,
    cwdDefaultConfigPath,
    rootEnvConfigPath,
    rootDefaultConfigPath,
  ]);
};

export const LocalNameProvider: LocalNameProvider = {
  name: 'LocalNameProvider',
  init() {
    const providerConfigPath = getProviderConfigPath();
    if (providerConfigPath) {
      this.names = JSON.parse(fs.readFileSync(providerConfigPath, { encoding: 'utf-8' }));
      // start watcher
      this.watcher = fs.watch(providerConfigPath, null, (eventType) => {
        if (eventType === 'rename') {
          this.watcher?.close();
          return;
        }
        // try to update
        this.names = JSON.parse(fs.readFileSync(providerConfigPath, { encoding: 'utf-8' }));
      });
    }
  },
  getTarget(name: string) {
    return this.names?.[name];
  },
};
