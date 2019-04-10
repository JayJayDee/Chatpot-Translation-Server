import { injectable } from 'smart-factory';
import { isArray } from 'util';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { InvalidParamError } from '../errors';
import { TranslatorTypes, TranslatorModules } from '../translator';
import { UtilModules, UtilTypes } from '../utils';

injectable(EndpointModules.Translation.TranslateRooms,
  [ EndpointModules.Utils.WrapAync,
    UtilModules.Auth.DecryptRoomToken,
    TranslatorModules.Translate ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    decryptRoomToken: UtilTypes.Auth.DecryptRoomToken,
    translate: TranslatorTypes.Translate) =>

  ({
    uri: '/translate/room',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        const queriesExpr = req.query.query;
        const to = req.query.to;

        if (!queriesExpr || !to) {
          throw new InvalidParamError('query required');
        }

        const queries = parseQuery(queriesExpr, to);
        queries.map((q) => {
          if (decryptRoomToken(q.key) === null)
            throw new InvalidParamError(`invalid room_token: ${q.key}`);
        });
        const promises = queries.map((q) => translate(q));
        const resp = await Promise.all(promises);

        res.status(200).json(resp);
      })
    ]
  }));


injectable(EndpointModules.Translation.TranslateMessages,
  [ EndpointModules.Utils.WrapAync,
    TranslatorModules.Translate ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    translate: TranslatorTypes.Translate) =>

  ({

    uri: '/translate/message',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        const queriesExpr = req.query.query;
        const to = req.query.to;

        if (!queriesExpr || !to) {
          throw new InvalidParamError('query required');
        }

        const queries = parseQuery(queriesExpr, to);
        console.log(queries);

        res.status(200).json({});
      })
    ]
  }));


const parseQuery =
  (queryExpr: string, to: string): TranslatorTypes.TranslateParam[] => {
    let queries = null;
    try {
      queries = JSON.parse(queryExpr);
      if (isArray(queries) === false) throw new Error('');
      queries.map((q: any) => {
        if (!q.key || !q.message || !q.from) throw new Error('');
      });
    } catch (err) {
      throw new InvalidParamError('query must be a stringified json-array, (attr: key, message, from)');
    }

    const params: TranslatorTypes.TranslateParam[] =
      queries.map((q: any) => ({
        from: q.from,
        to,
        message: q.message,
        key: q.key
      }));
    return params;
  };