import { injectable } from 'smart-factory';
import { StoreModules } from './modules';
import { StoreTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';

injectable(StoreModules.StoreTranslation,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<StoreTypes.StoreTranslations> =>

    async (translations) => {
      // TODO: to be implemented
    });


injectable(StoreModules.FetchTranslation,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<StoreTypes.FetchTranslations> =>

    async (queries) => {
      // TODO: to be implemented
      return [];
    });