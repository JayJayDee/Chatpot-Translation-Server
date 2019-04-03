import { injectable } from 'smart-factory';
import { createHash } from 'crypto';
import { TranslatorModules } from './modules';
import { TranslatorTypes } from './types';

const translate = require('google-translate-api');

injectable(TranslatorModules.TranslateViaGoogle,
  [],
  async (): Promise<TranslatorTypes.Translate> =>
    async (param) => translateWithKey(param));

const translateWithKey =
  (param: TranslatorTypes.TranslateParam): Promise<TranslatorTypes.Translated> =>
    new Promise((resolve, reject) => {
      translate(param.message, {
        from: param.from,
        to: param.to
      }).then((resp: any) => {
        resolve({
          key: param.key,
          translated: resp.text,
          hash: translatedHash(param)
        });
      }).catch(reject);
    });

const translatedHash =
  (param: TranslatorTypes.TranslateParam) =>
    createHash('sha1')
      .update(`${param.from}${param.to}${stripMessageBeforeHash(param.message)}`)
      .digest('hex');

const stripMessageBeforeHash =
  (message: string) =>
    message.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\ ]/gi, '');