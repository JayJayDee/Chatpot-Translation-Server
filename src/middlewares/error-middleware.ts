import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';
import { BaseLogicError, BaseSecurityError, SecurityExpireError } from '../errors';
import { LoggerModules, LoggerTypes } from '../loggers';

injectable(MiddlewareModules.Error,
  [ LoggerModules.Logger ],
  async (log: LoggerTypes.Logger): Promise<MiddlewareTypes.Error> =>
    (err, req, res, next) => {
      if (err) {
        log.error(err);
        res.status(statusCode(err)).json({
          code: code(err),
          message: message(err)
        });
        return;
      }
      next();
    });

const statusCode = (err: Error) =>
  err instanceof BaseLogicError ? 400 :
    err instanceof BaseSecurityError ? 401 : 500;

const code = (err: Error) =>
  err instanceof BaseLogicError ? err.code :
    err instanceof BaseSecurityError ?
      err instanceof SecurityExpireError ?
        'SESSION_EXPIRED' : 'UNAUTHORIZED' : 'UNEXPECTED_ERROR';

const message = (err: Error) => err.message;