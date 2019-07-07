import { Express } from 'express';

export namespace SwaggerTypes {
  export type SwaggerRegisterer = (app: Express) => void;
}