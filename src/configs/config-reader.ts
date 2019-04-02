import { readFile } from 'fs';
import { ConfigTypes } from './types';
import { ConfigModules } from './modules';
import { ConfigurationError } from './errors';
import { injectable } from 'smart-factory';

injectable(ConfigModules.ConfigReader,
  [],
  async (): Promise<ConfigTypes.ConfigReader> =>
    read(process.env));

const read = (src: ConfigTypes.ConfigSource): ConfigTypes.ConfigReader =>
  async () => {
    const configPath = src['CONFIG_FILE'];
    if (!configPath) return src;
    const configSrc = await readFileContent(configPath);
    return configSrc;
  };

export const readFileContent = (path: string) =>
  new Promise((resolve, reject) => {
    readFile(path, ((err, data) => {
      if (err) return reject(new ConfigurationError(`unable to read config file: ${path}`));
      try {
        const content = JSON.parse(data.toString());
        resolve(content);
      } catch (err) {
        return reject(new ConfigurationError(`invalid config file: ${path}`));
      }
    }));
  });