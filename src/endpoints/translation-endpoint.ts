import { injectable } from 'smart-factory';
import { isArray } from 'util';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { InvalidParamError } from '../errors';
import { TranslatorTypes, TranslatorModules } from '../translator';

injectable(EndpointModules.Translation.Translate,
  [ EndpointModules.Utils.WrapAync,
    TranslatorModules.Translate ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    translate: TranslatorTypes.Translate): Promise<EndpointTypes.Endpoint> => ({
    uri: '/translate',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        const queriesExpr = req.query.query;
        const from = req.query.from;
        const to = req.query.to;
        let queries = null;

        if (!queriesExpr || !from || !to) {
          throw new InvalidParamError('query required');
        }

        try {
          queries = JSON.parse(queriesExpr);
          if (isArray(queries) === false) throw new Error('');
          queries.map((q: any) => {
            if (!q.key || !q.message) throw new Error('');
          });
        } catch (err) {
          throw new InvalidParamError('query must be a stringified json-array, (attr: key, message');
        }

        const params: TranslatorTypes.TranslateParam[] =
          queries.map((q: any) => ({
            from: from,
            to: to,
            message: q.message,
            key: q.key
          }));
        const translatedPromises = params.map((p) => translate(p));
        const all = await Promise.all(translatedPromises);
        res.status(200).json(all);
      })
    ]
  }));