import { get } from 'lodash';
import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';
import { UtilModules, UtilTypes } from '../utils';
import { BaseSecurityError, SecurityExpireError } from '../errors';
import { ConfigModules, ConfigTypes } from '../configs';
import { LoggerModules, LoggerTypes } from '../loggers';

class AuthenticationFailError extends BaseSecurityError {}
class AuthorizationFailError extends BaseSecurityError {}

injectable(MiddlewareModules.Authentication,
  [ ConfigModules.CredentialConfig,
    LoggerModules.Logger,
    UtilModules.Auth.ValidateSessionKey ],
  async (cfg: ConfigTypes.CredentialConfig,
    log: LoggerTypes.Logger,
    validateSessionKey: UtilTypes.Auth.ValidateSessionKey): Promise<MiddlewareTypes.Authentication> =>

      (req, res, next) => {
        if (cfg.authEnabled === false) {
          log.debug('[auth-middleware] auth-disabled. ignoring authentication.');
          return next();
        }
        log.debug('[auth-middleware] auth-enabled. starting authentication..');

        const sessionKey: string = req.query.session_key;
        if (!sessionKey) return next(new AuthenticationFailError('session_key not found'));

        const validated = validateSessionKey(sessionKey);
        if (validated.valid === false) return next(new AuthenticationFailError('invalid session_key'));
        if (validated.expired === true) return next(new SecurityExpireError('session_key expired'));

        res.locals['member_no'] = validated.member_no;
        next();
      });

injectable(MiddlewareModules.Authorization,
  [ ConfigModules.CredentialConfig,
    LoggerModules.Logger,
    UtilModules.Auth.DecryptMemberToken,
    UtilModules.Auth.ValidateSessionKey ],
  async (cfg: ConfigTypes.CredentialConfig,
    log: LoggerTypes.Logger,
    decryptMemberToken: UtilTypes.Auth.DecryptMemberToken,
    validateSessionKey: UtilTypes.Auth.ValidateSessionKey): Promise<MiddlewareTypes.Authorization> =>

      (memberTokenPath: string[]) =>
        (req, res, next) => {
          if (cfg.authEnabled === false) {
            log.debug('[auth-middleware] auth-disabled. ignoring authorization.');
            return next();
          }
          log.debug('[auth-middleware] auth-enabled. starting authorization..');

          const sessionKey: string = req.query.session_key;
          const memberToken: string = get(req, memberTokenPath);

          if (!sessionKey) return next(new AuthorizationFailError('session_key not supplied'));
          if (!memberToken) return next(new AuthorizationFailError('member_token not supplied'));

          const member = decryptMemberToken(memberToken);
          if (!member) return next(new AuthorizationFailError('invalid member_token'));

          const validated = validateSessionKey(sessionKey);
          if (validated.valid === false) return next(new AuthorizationFailError('invalid session_key'));
          if (validated.expired === true) return next(new SecurityExpireError('session_key expired'));
          if (validated.member_no !== member.member_no) return next(new AuthorizationFailError('not allowed operation'));

          res.locals['member_no'] = validated.member_no;
          next();
        });