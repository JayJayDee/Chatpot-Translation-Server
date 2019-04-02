import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';

export { EndpointTypes } from './types';
export { EndpointModules } from './modules';

// register endpoints to container.
injectable(EndpointModules.Endpoints,
  [ ],
  async () =>
    ([
    ]));