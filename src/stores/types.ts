export namespace StoreTypes {
  export type Translation = {
    from: string;
    to: string;
    message: string;
    translated: string;
  };
  export type TranslationQuery = {
    from: string;
    to: string;
    message: string;
  };

  export type StoreTranslations = (translates: Translation[]) => Promise<void>;
  export type FetchTranslations = (queries: TranslationQuery) => Promise<Translation[]>;
}