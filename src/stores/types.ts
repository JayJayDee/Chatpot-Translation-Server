export namespace StoreTypes {
  export type Translation = {
    from: string;
    to: string;
    message: string;
    translated: string;
    key: string;
  };
  export type TranslationQuery = {
    from: string;
    to: string;
    message: string;
    key: string;
  };
  export type Translated = {
    from: string;
    to: string;
    message: string;
    translated: string;
    key: string;
  };

  export type StoreTranslations = (translates: Translation[]) => Promise<void>;
  export type FetchTranslations = (queries: TranslationQuery[]) => Promise<Translated[]>;
}