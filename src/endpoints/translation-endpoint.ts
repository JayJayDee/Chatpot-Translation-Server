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
        const from = req.query.from;
        const to = req.query.to;

        if (!queriesExpr || !from || !to) {
          throw new InvalidParamError('query required');
        }

        const queries = parseQuery(queriesExpr, from, to);
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
        const from = req.query.from;
        const to = req.query.to;

        if (!queriesExpr || !from || !to) {
          throw new InvalidParamError('query required');
        }

        const queries = parseQuery(queriesExpr, from, to);
        console.log(queries);

        res.status(200).json({});
      })
    ]
  }));


const parseQuery =
  (queryExpr: string, from: string, to: string): TranslatorTypes.TranslateParam[] => {
    let queries = null;
    try {
      queries = JSON.parse(queryExpr);
      if (isArray(queries) === false) throw new Error('');
      queries.map((q: any) => {
        if (!q.key || !q.message) throw new Error('');
      });
    } catch (err) {
      throw new InvalidParamError('query must be a stringified json-array, (attr: key, message)');
    }

    const params: TranslatorTypes.TranslateParam[] =
      queries.map((q: any) => ({
        from: from,
        to: to,
        message: q.message,
        key: q.key
      }));
    return params;
  };