export class BaseLogicError extends Error {
  private _code: string;
  constructor(code: string, payload: any) {
    super(payload);
    this._code = code;
  }
  public get code() { return this._code; }
}

export class InvalidParamError extends BaseLogicError {
  constructor(paramExpr: string) {
    super('INVALID_PARAM', paramExpr);
  }
}

export class BaseSecurityError extends Error {
  constructor(msg: any) {
    super(msg);
  }
}

export class SecurityExpireError extends BaseSecurityError {
  constructor(msg: any) {
    super(msg);
  }
}