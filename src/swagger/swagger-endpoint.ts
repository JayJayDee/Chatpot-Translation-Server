import { injectable } from 'smart-factory';
import * as swaggerUi from 'swagger-ui-express';
import { SwaggerModules } from './modules';
import { SwaggerTypes } from './types';
import { LoggerModules, LoggerTypes } from '../loggers';

const uri = '/apidoc';

injectable(SwaggerModules.SwaggerRegisterer,
  [ LoggerModules.Logger,
    SwaggerModules.SwaggerConfigurator ],
  async (log: LoggerTypes.Logger,
    conf: any): Promise<SwaggerTypes.SwaggerRegisterer> =>

    (app) => {
      const deepLinking = true;
      app.use(uri, swaggerUi.serve, swaggerUi.setup(conf, { deepLinking }));
      log.debug(`[swagger] swagger-apidoc registered: ${uri}`);
    });