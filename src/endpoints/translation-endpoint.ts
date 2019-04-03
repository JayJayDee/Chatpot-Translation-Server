import { injectable } from 'smart-factory';
import { isArray } from 'util';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { InvalidParamError } from '../errors';

injectable(EndpointModules.Translation.Translate,
  [ EndpointModules.Utils.WrapAync ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> => ({
    uri: '/translate',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync((req, res, next) => {
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
        } catch (err) {
          throw new InvalidParamError('query must be a stringified json-array');
        }

        res.status(200).json({});
      })
    ]
  }));