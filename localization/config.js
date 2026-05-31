export const LOCALES = {
  fa: "fa",
  en: "en",
};

export const LOCALE_COOKIE = "black-five-back-office-locale";
export const DEFAULT_LOCALE = LOCALES.fa;

export const DIRECTIONS = {
  [LOCALES.fa]: "rtl",
  [LOCALES.en]: "ltr",
};

export const getDirection = (locale) => DIRECTIONS[locale] || DIRECTIONS[DEFAULT_LOCALE];
export const isLocale = (locale) => Object.values(LOCALES).includes(locale);
    