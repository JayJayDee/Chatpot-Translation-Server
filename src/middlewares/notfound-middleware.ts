import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';

injectable(MiddlewareModules.NotFound,
  [],
  async (): Promise<MiddlewareTypes.NotFound> =>
    (req, res, next) => {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: `resource not found for ${req.url}`
      });
    });