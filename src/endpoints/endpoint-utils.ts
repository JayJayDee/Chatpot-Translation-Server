import { injectable } from 'smart-factory';
import { RequestHandler } from 'express';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';

injectable(EndpointModules.Utils.WrapAync,
  [],
  async (): Promise<EndpointTypes.Utils.WrapAsync> =>
    (endpoint: RequestHandler) =>
      async (req, res, next) => {
        try {
          await endpoint(req, res, next);
        } catch (err) {
          return next(err);
        }
      });