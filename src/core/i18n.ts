import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '../locales/ar.json';
import en from '../locales/en.json';
import ur from '../locales/ur.json';
import tl from '../locales/tl.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
  ur: { translation: ur },
  tl: { translation: tl }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Handle direction and font on language change
function applyLanguageLayout(lng: string) {
  const isRTL = lng === 'ar' || lng === 'ur';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;

  if (lng === 'ur') {
    document.documentElement.classList.add('font-urdu');
    document.documentElement.classList.remove('font-arabic');
  } else {
    document.documentElement.classList.add('font-arabic');
    document.documentElement.classList.remove('font-urdu');
  }
}

i18n.on('languageChanged', applyLanguageLayout);
applyLanguageLayout(i18n.language ?? 'ar');

export default i18n;
