import { NameProvider } from '../types/provider';

interface HttpRemoteProvider extends NameProvider {
  fetchSource?: string;
  timer?: ReturnType<typeof setInterval>;
  update: () => Promise<void>;
}

const DEFAULT_FETCH_INTERVAL = 10 * 1000;

export const HttpRemoteProvider: HttpRemoteProvider = {
  name: 'HttpRemoteProvider',
  async init() {
    this.fetchSource = process.env.PROVIDER_DATA_SOURCE || '';
    if (!this.fetchSource || !window.fetch) {
      this.names = {};
    }
    this.update();
    this.timer = setInterval(() => {
      this.update();
    }, Number(process.env.PROVIDER_FETCH_INTERVAL || DEFAULT_FETCH_INTERVAL) || DEFAULT_FETCH_INTERVAL);
  },
  async update() {
    if (!this.fetchSource) {
      this.names = {};
      return;
    }
    const res = await fetch(this.fetchSource, {
      method: process.env.PROVIDER_FETCH_METHOD || 'GET',
      body: process.env.PRODIVER_FETCH_BODY || undefined,
    });
    this.names = JSON.parse(await res.json());
  },
  getTarget(name) {
    return this.names?.[name];
  },
};
