export namespace UtilModules {
  export enum Auth {
    CreateMemberToken = 'Util/Auth/CreateMemberToken',
    DecryptMemberToken = 'Util/Auth/DecryptMemberToken',
    CrateRoomToken = 'Util/Auth/CreateRoomToken',
    DecryptRoomToken = 'Util/Auth/DecryptRoomToken',
    ValidateSessionKey = 'Util/Auth/ValidateSessionkey',
    DecryptMessageToken = 'Util/Auth/DecryptMessageToken'
  }

  export enum Translate {
    CreateTranslationHash = 'Util/Translate/CreateTranslationHash'
  }
}