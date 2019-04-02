import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';

injectable(EndpointModules.Translation.Translate,
  [ EndpointModules.Utils.WrapAync ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> => ({
    uri: '/translate',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync((req, res, next) => {
        res.status(200).json({});
      })
    ]
  }));