export namespace TranslatorTypes {
  export type TranslateParam = {
    key: string;
    from: string;
    to: string;
    message: string;
  };
  export type Translated = {
    from: string;
    to: string;
    key: string;
    message: string;
    translated: string;
  };
  export type TranslatedHash = string;

  export type Translate = (param: TranslateParam) => Promise<Translated>;
}