import { injectable } from 'smart-factory';
import { createHash } from 'crypto';
import { StoreModules } from './modules';
import { StoreTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';

interface HashedQuery extends StoreTypes.Translation {
  hash: string;
}

injectable(StoreModules.StoreTranslation,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<StoreTypes.StoreTranslations> =>

    async (translations) => {
      const hashmap = hashedQueryMap(translations);
      await mysql.transaction(async (connection) => {
        const promises = Object.keys(hashmap).map((k) => {
          const tableName = `translated_${k}`;
          const values: any[] = [];
          const valuesQueries: string[] = [];

          hashmap[k].forEach((q) => {
            valuesQueries.push('(?,?,?,?,?,NOW())');
            values.push(q.hash, q.from, q.to, q.message, q.translated);
          });

          const sql = `
            INSERT INTO ${tableName}
              (hash, src, dst, original, translated, reg_date)
            VALUES
              ${valuesQueries.join(',')}
          `;
          return connection.query(sql, values);
        });

        try {
          await Promise.all(promises);
        } catch (err) {
          connection.rollback();
        }
      });
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

const hashedQueryMap = (translations: StoreTypes.Translation[]): {[key: string]: HashedQuery[]} => {
  const hashmap: {[firstLetter: string]: HashedQuery[]} = {};
  translations.forEach((t) => {
    const hash = createQueryHash(t);
    const first = hash.substring(0, 1);
    if (!hashmap[first]) hashmap[first] = [];
    hashmap[first].push({
      hash,
      ... t
    });
  });
  return hashmap;
};

const createQueryHash = (query: StoreTypes.TranslationQuery) =>
  createHash('sha256').update(`${sanitizeMessage(query.message)}_${query.from}_${query.to}`).digest('hex');

const sanitizeMessage = (message: string) =>
  message.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\ ]/gi, '');