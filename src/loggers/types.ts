export namespace LoggerTypes {
  export interface Logger {
    info: (payload: any) => void;
    debug: (payload: any) => void;
    error: (payload: any) => void;
  }
}