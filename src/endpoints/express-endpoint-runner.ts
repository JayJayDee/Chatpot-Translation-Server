import { injectable } from 'smart-factory';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Application } from 'express';

import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';
import { LoggerModules, LoggerTypes } from '../loggers';
import { MiddlewareModules, MiddlewareTypes } from '../middlewares';

injectable(EndpointModules.EndpointRunner,

  [ConfigModules.HttpConfig,
    LoggerModules.Logger,
    EndpointModules.Endpoints,
    MiddlewareModules.Error,
    MiddlewareModules.NotFound],

  async (cfg: ConfigTypes.HttpConfig,
    log: LoggerTypes.Logger,
    endpoints: EndpointTypes.Endpoint[],
    error: MiddlewareTypes.Error,
    notFound: MiddlewareTypes.NotFound): Promise<EndpointTypes.EndpointRunner> =>

    () => {
      const app = express();
      app.use(bodyParser.urlencoded({ extended: true }));
      registerEndpoints(app, endpoints, log);
      app.use(error);
      app.use(notFound);

      app.listen(cfg.port, () => {
        log.info(`[http] http server stared with port: ${cfg.port}`);
      });
    });

const registerEndpoints =
  (app: Application,
    endpoints: EndpointTypes.Endpoint[],
    log: LoggerTypes.Logger) => {
    endpoints.map((e) => {
      if (e.method === EndpointTypes.EndpointMethod.GET) {
        app.get(e.uri, e.handler);
      } else if (e.method === EndpointTypes.EndpointMethod.POST) {
        app.post(e.uri, e.handler);
      }
      log.info(`[http] endpoint registered: ${e.method} ${e.uri}`);
    });
  };