import { RequestHandler, Router } from 'express';

export namespace EndpointTypes {
  export enum EndpointMethod {
    POST = 'post', GET = 'get'
  }
  export type Endpoint = {
    uri: string;
    handler: RequestHandler[];
    method: EndpointMethod;
  };
  export type EndpointRouter = {
    uri: string;
    router: Router;
  };
  export type Authenticator = (tokenPath: string[]) => RequestHandler;
  export type EndpointRunner = () => void;

  export namespace Utils {
    export type WrapAsync = (handler: RequestHandler) => RequestHandler;
  }
}