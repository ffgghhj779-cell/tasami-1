import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ROUTE_TITLE_KEYS: Record<string, string> = {
  '/':           'pages.langSelect',
  '/home':       'pages.home',
  '/login':      'pages.login',
  '/profile':    'pages.profile',
  '/booking':    'pages.booking',
  '/confirm':    'pages.confirm',
  '/success':    'pages.success',
  '/contracts':  'pages.contracts',
  '/register-artisan': 'pages.registerArtisan',
  '/how':        'pages.how',
  '/terms':      'pages.terms',
  '/privacy':    'pages.privacy',
  '/admin':      'pages.admin',
};

function resolveTitleKey(pathname: string): string {
  if (ROUTE_TITLE_KEYS[pathname]) return ROUTE_TITLE_KEYS[pathname];
  if (pathname.startsWith('/service/')) return 'pages.serviceDetails';
  if (pathname.startsWith('/artisan/')) return 'pages.artisanPortfolio';
  return 'pages.home';
}

export function useDocumentTitle() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const pageKey = resolveTitleKey(location.pathname);
    const pageTitle = t(pageKey);
    const appName = t('app.name');
    document.title = `${appName} | ${pageTitle}`;
  }, [location.pathname, t, i18n.language]);
}
