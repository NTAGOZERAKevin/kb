import { useEffect, useState } from 'react';
import { translations } from '../i18n/translations.js';
import { LanguageContext } from './language-context.js';

const STORAGE_KEY = 'bom-language';
const SUPPORTED = Object.keys(translations);

function getInitialLanguage() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return SUPPORTED.includes(stored) ? stored : 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  function translate(key) {
    const read = (dictionary) =>
      key.split('.').reduce((value, part) => value?.[part], dictionary);

    return read(translations[language]) ?? read(translations.en) ?? key;
  }

  const value = {
    language,
    setLanguage,
    languages: SUPPORTED,
    t: translate,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
