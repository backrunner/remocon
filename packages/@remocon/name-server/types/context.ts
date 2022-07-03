import { Context } from 'koa';
import { NameProvider } from './provider';

export interface AppContext {
  provider: NameProvider;
}

export type RequestContext = Context & AppContext;
