import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ServiceItem } from '../hooks/useServices';

export function useFilteredServices(services: ServiceItem[], query: string) {
  const { t } = useTranslation();

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;

    return services.filter(service => {
      const title = t(service.titleKey).toLowerCase();
      if (title.includes(q)) return true;
      return service.keywords.some(kw => kw.toLowerCase().includes(q));
    });
  }, [services, query, t]);
}
