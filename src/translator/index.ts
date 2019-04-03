import { injectable } from 'smart-factory';
import { TranslatorModules } from './modules';
import { TranslatorTypes } from './types';

injectable(TranslatorModules.Translate,
  [ TranslatorModules.TranslateViaGoogle ],
  async (google): Promise<TranslatorTypes.Translate> =>
    (param) => google(param));

export { TranslatorModules } from './modules';
export { TranslatorTypes } from './types';