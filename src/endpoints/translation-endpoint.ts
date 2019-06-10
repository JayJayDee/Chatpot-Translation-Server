import { injectable } from 'smart-factory';
import { isArray } from 'util';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { InvalidParamError } from '../errors';
import { TranslatorTypes, TranslatorModules } from '../translator';
import { UtilModules, UtilTypes } from '../utils';
import { StoreModules, StoreTypes } from '../stores';
import { LoggerModules, LoggerTypes } from '../loggers';

injectable(EndpointModules.Translation.TranslateRooms,
  [ EndpointModules.Utils.WrapAync,
    UtilModules.Auth.DecryptRoomToken,
    TranslatorModules.Translate,
    StoreModules.FetchTranslation,
    StoreModules.StoreTranslation,
    UtilModules.Translate.CreateTranslationHash ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    decryptRoomToken: UtilTypes.Auth.DecryptRoomToken,
    translate: TranslatorTypes.Translate,
    fetchTranslationCache: StoreTypes.FetchTranslations,
    storeTranslationsToCache: StoreTypes.StoreTranslations,
    translationHash: UtilTypes.Translate.CreateTranslateHash) =>

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

        const caches = await fetchTranslationCache(queries);

        const filteredQueries = queries.filter((q) =>
          caches.filter((c) => c.hash === translationHash(q)).length === 0);

        let resp: TranslatorTypes.Translated[] = [];
        if (filteredQueries.length > 0) {
          const promises = filteredQueries.map((q) => translate(q));
          resp = await Promise.all(promises);
          await storeTranslationsToCache(resp);
        }
        res.status(200).json([... caches, ... resp ]);
      })
    ]
  }));


injectable(EndpointModules.Translation.TranslateMessages,
  [ EndpointModules.Utils.WrapAync,
    UtilModules.Auth.DecryptMessageId,
    TranslatorModules.Translate,
    StoreModules.FetchTranslation,
    UtilModules.Translate.CreateTranslationHash,
    StoreModules.StoreTranslation,
    LoggerModules.Logger ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    decryptMessageId: UtilTypes.Auth.DecryptMessageId,
    translate: TranslatorTypes.Translate,
    fetchTranslationCache: StoreTypes.FetchTranslations,
    translationHash: UtilTypes.Translate.CreateTranslateHash,
    storeTranslationsToCache: StoreTypes.StoreTranslations,
    log: LoggerTypes.Logger) =>

  ({
    uri: '/translate/message',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        const queriesExpr = req.query.query;
        const to = req.query.to;

        log.debug('[translate-message] !');

        if (!queriesExpr || !to) {
          throw new InvalidParamError('query required');
        }

        const queries = parseQuery(queriesExpr, to);
        queries.map((q) => {
          if (decryptMessageId(q.key).valid === false) {
            throw new InvalidParamError(`invalid message id: ${q.key}`);
          }
        });

        const caches = await fetchTranslationCache(queries);

        const filteredQueries = queries.filter((q) =>
          caches.filter((c) => c.hash === translationHash(q)).length === 0);

        let resp: TranslatorTypes.Translated[] = [];
        if (filteredQueries.length > 0) {
          const promises = filteredQueries.map((q) => translate(q));
          resp = await Promise.all(promises);
          await storeTranslationsToCache(resp);
        }

        log.debug(`[translate-message] num_requested:${queries.length}, num_gapi:${resp.length}, num_cached:${caches.length}`);

        res.status(200).json([ ...caches, ...resp ]);
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