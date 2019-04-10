import { createHash } from 'crypto';
import { injectable } from 'smart-factory';
import { UtilModules } from './modules';
import { UtilTypes } from './types';

injectable(UtilModules.Translate.CreateTranslationHash,
  [],
  async (): Promise<UtilTypes.Translate.CreateTranslateHash> =>
    (param) =>
      createHash('sha1')
      .update(`${param.from}${param.to}${stripMessageBeforeHash(param.message)}`)
      .digest('hex'));

const stripMessageBeforeHash =
  (message: string) =>
    message.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\ ]/gi, '');