import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import appRoutes from './routes';
import { DEFAULT_PORT, DEFAULT_PROVIDER } from './constants';
import { AppContext } from './types/context';
import { LocalNameProvider } from './provider';

const providers = [LocalNameProvider];

providers.forEach((provider) => {
  if (typeof provider?.init === 'function') {
    provider.init();
  }
});

const getProvider = (providerName: string) => {
  return providers.find((provider) => provider?.name === providerName);
};

export const createServer = async () => {
  const app = new Koa<Koa.DefaultState, AppContext>();
  const router = new Router();

  appRoutes.forEach((route) => router[route.method](route.path, route.target));

  const provider = getProvider(process.env.NAME_PROVIDER || DEFAULT_PROVIDER);
  if (!provider) {
    throw new Error('Cannot find the specified provider.');
  }
  app.context.provider = provider;

  app.use(cors());
  app.use(bodyParser());

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(process.env.PORT || DEFAULT_PORT);
};
