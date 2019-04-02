import { resolve, init } from 'smart-factory';
import { ConfigTypes, ConfigModules } from './configs';
import { LoggerTypes, LoggerModules } from './loggers';

(async () => {
  await init({
    includes: [
      `${__dirname}/**/*.ts`,
      `${__dirname}/**/*.js`
    ]
  });

  const cfg = resolve<ConfigTypes.RootConfig>(ConfigModules.RootConfig);
  const log = resolve<LoggerTypes.Logger>(LoggerModules.Logger);

  log.info(cfg);
})();