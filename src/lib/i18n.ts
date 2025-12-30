import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from '../../public/locales/en/translation.json';
import jaTranslation from '../../public/locales/ja/translation.json';

const resources = {
  en: { translation: enTranslation },
  ja: { translation: jaTranslation },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18next;
