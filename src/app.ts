import { resolve, init } from 'smart-factory';
import { EndpointTypes, EndpointModules } from './endpoints';

(async () => {
  await init({
    includes: [
      `${__dirname}/**/*.ts`,
      `${__dirname}/**/*.js`
    ]
  });

  const runHttp = resolve<EndpointTypes.EndpointRunner>(EndpointModules.EndpointRunner);
  runHttp();
})();