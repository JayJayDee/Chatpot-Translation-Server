import { set } from 'lodash';

import { ConfigTypes } from './types';
import { ConfigModules } from './modules';
import { ConfigurationError } from './errors';
import { injectable } from 'smart-factory';

injectable(ConfigModules.ConfigParser,
  [ConfigModules.EmptyConfig],
  async (emptyConfig: ConfigTypes.RootConfig): Promise<ConfigTypes.ConfigParser> =>

    (src: ConfigTypes.ConfigSource, rules: ConfigTypes.ConfigRule[]) => {
      rules.map((rule: ConfigTypes.ConfigRule) => {
        const value = src[rule.key];
        if (value === undefined && rule.defaultValue === undefined) {
          throw new ConfigurationError(`configuration not supplied: ${rule.key}`);
        }

        if (value === undefined && rule.defaultValue !== undefined) {
          set(emptyConfig, rule.path, rule.defaultValue);
        } else {
          set(emptyConfig, rule.path, value);
        }
      });
      return emptyConfig;
    });