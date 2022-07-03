import Koa from 'koa';
import type Router from '@koa/router';
import { AppContext } from './types/context';
import nameController from './controller/name';

enum HttpMethod {
  GET = 'get',
  POST = 'post',
}

interface Route {
  path: string;
  method: HttpMethod;
  target: Router.Middleware<Koa.DefaultState, AppContext>;
}

const routes: Route[] = [
  {
    path: '/getTarget',
    method: HttpMethod.GET,
    target: nameController.getTarget,
  },
];

export default routes;
