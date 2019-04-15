import { injectable } from 'smart-factory';
import { createHash } from 'crypto';
import { StoreModules } from './modules';
import { StoreTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';

injectable(StoreModules.StoreTranslation,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<StoreTypes.StoreTranslations> =>

    async (translations) => {
      const hashes = translations.map(createQueryHash);
      console.log(hashes);
      // TODO: select using hashes
    });


injectable(StoreModules.FetchTranslation,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<StoreTypes.FetchTranslations> =>

    async (queries) => {
      const hashes = queries.map(createQueryHash);
      console.log(hashes);
      // TODO: select using hashes
      return [];
    });

const createQueryHash = (query: StoreTypes.TranslationQuery) =>
  createHash('sha256').update(`${sanitizeMessage(query.message)}_${query.from}_${query.to}`).digest('hex');

const sanitizeMessage = (message: string) =>
  message.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\ ]/gi, '');
