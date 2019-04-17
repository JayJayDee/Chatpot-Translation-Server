import { injectable } from 'smart-factory';
import { TranslatorModules } from './modules';
import { TranslatorTypes } from './types';
import { UtilModules, UtilTypes } from '../utils';

const translate = require('@vitalets/google-translate-api');

injectable(TranslatorModules.TranslateViaGoogle,
  [ UtilModules.Translate.CreateTranslationHash ],
  async (translateHash: UtilTypes.Translate.CreateTranslateHash): Promise<TranslatorTypes.Translate> =>
    async (param) => translateWithKey(param, translateHash));

const translateWithKey =
  (param: TranslatorTypes.TranslateParam,
    translateHash: UtilTypes.Translate.CreateTranslateHash): Promise<TranslatorTypes.Translated> =>
      new Promise((resolve, reject) => {
        translate(param.message, {
          from: param.from,
          to: param.to
        }).then((resp: any) => {
          resolve({
            from: param.from,
            to: param.to,
            key: param.key,
            message: param.message,
            translated: resp.text,
          });
        }).catch(reject);
      });