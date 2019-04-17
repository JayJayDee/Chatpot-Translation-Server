import { injectable } from 'smart-factory';
import { StoreModules } from './modules';
import { StoreTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';
import { LoggerModules, LoggerTypes } from '../loggers';
import { UtilTypes, UtilModules } from '../utils';

interface HashedTranslation extends StoreTypes.Translation {
  hash: string;
}
interface HashedQuery extends StoreTypes.TranslationQuery {
  hash: string;
}

injectable(StoreModules.StoreTranslation,
  [ LoggerModules.Logger,
    MysqlModules.Mysql,
    UtilModules.Translate.CreateTranslationHash ],
  async (log: LoggerTypes.Logger,
    mysql: MysqlTypes.MysqlDriver,
    translationHash: UtilTypes.Translate.CreateTranslateHash): Promise<StoreTypes.StoreTranslations> =>

    async (translations) => {
      const hashmap = hashedTranslation(translations, translationHash);
      await mysql.transaction(async (connection) => {
        const promises = Object.keys(hashmap).map((k) => {
          const tableName = `translated_${k}`;
          const values: any[] = [];
          const valuesQueries: string[] = [];

          log.debug(`[translation-store] translation stored as a cache, table: ${tableName}`);

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
  [ LoggerModules.Logger,
    MysqlModules.Mysql,
    UtilModules.Translate.CreateTranslationHash ],
  async (log: LoggerTypes.Logger,
    mysql: MysqlTypes.MysqlDriver,
    translationHash: UtilTypes.Translate.CreateTranslateHash): Promise<StoreTypes.FetchTranslations> =>

    async (queries) => {
      const hashmap = hashedQuery(queries, translationHash);
      const hashKeyMap: {[hash: string]: string} = {};

      const values: any[] = [];
      const sqls = Object.keys(hashmap).map((k) => {
        const elems = hashmap[k];
        const inClause = elems.map((i) => {
          hashKeyMap[i.hash] = i.key;
          values.push(i.hash);
          return '?';
        }).join(',');

        const tableName = `translated_${k}`;
        return `
          SELECT
            src AS 'from',
            dst AS 'to',
            original AS message,
            translated,
            hash
          FROM
            ${tableName}
          WHERE
            hash IN (${inClause})
        `;
      });

      const sql = sqls.join(' UNION ');
      const rows: any[] = await mysql.query(sql, values) as any[];
      const result: StoreTypes.Translation[] = rows.map((r) => ({
        from: r.from,
        to: r.to,
        translated: r.translated,
        message: r.message,
        key: hashKeyMap[r.hash],
        hash: r.hash
      }));
      log.debug(`[translation-store] translation cache fetched, num_query=${queries.length}, num_result=${result.length}`);
      return result;
    });


const hashedTranslation =
  (translations: StoreTypes.Translation[],
    translationHash: UtilTypes.Translate.CreateTranslateHash): {[key: string]: HashedTranslation[]} => {
    const hashmap: {[firstLetter: string]: HashedTranslation[]} = {};
    translations.forEach((t) => {
      const hash = translationHash(t);
      const first = hash.substring(0, 1);
      if (!hashmap[first]) hashmap[first] = [];
      hashmap[first].push({
        hash,
        ... t
      });
    });
    return hashmap;
  };

const hashedQuery =
  (translations: StoreTypes.TranslationQuery[],
    translationHash: UtilTypes.Translate.CreateTranslateHash): {[key: string]: HashedQuery[]} => {
    const hashmap: {[firstLetter: string]: HashedQuery[]} = {};
    translations.forEach((t) => {
      const hash = translationHash(t);
      const first = hash.substring(0, 1);
      if (!hashmap[first]) hashmap[first] = [];
      hashmap[first].push({
        hash,
        ... t
      });
    });
    return hashmap;
  };