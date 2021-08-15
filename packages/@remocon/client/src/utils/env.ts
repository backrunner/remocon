import type { RemoconClientEnv } from '@remocon/core';

export const getLocalStorage = () => {
  if (!window.localStorage) {
    return null;
  }
  const record: Record<string, unknown> = {};
  const { length } = window.localStorage;
  for (let i = 0; i < length; i++) {
    const key = window.localStorage.key(i);
    if (key) {
      const val = window.localStorage.getItem(key);
      record[key] = val;
    }
  }
  return record;
};

export const getClientEnv = (): RemoconClientEnv => {
  const env: RemoconClientEnv = {
    userAgent: window.navigator.userAgent,
    url: window.location.href,
    lang: window.navigator.language,
    cookie: document.cookie,
    screen: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
  };
  const storage = getLocalStorage();
  if (storage) {
    Object.assign(env, {
      storage,
    });
  }
  return env;
};
