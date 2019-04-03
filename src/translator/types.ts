export namespace TranslatorTypes {
  export type TranslateParam = {
    key: string;
    from: string;
    to: string;
    message: string;
  };
  export type Translated = {
    key: string;
    translated: string;
    hash: string;
  };
  export type TranslatedHash = string;

  export type Translate = (param: TranslateParam) => Promise<Translated>;
}