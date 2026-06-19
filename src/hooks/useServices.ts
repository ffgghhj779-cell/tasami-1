import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../core/firebase';

export type ServiceIconType = 'sparkles' | 'wind' | 'briefcase' | 'building2' | 'star';
export type ServiceRouteType = 'service' | 'contracts';

export interface ServiceItem {
  id: string;
  slug: string;
  titleKey: string;
  icon: ServiceIconType;
  iconBg: string;
  iconFg: string;
  route: ServiceRouteType;
  order: number;
  keywords: string[];
}

/** Fallback catalog when Firestore `services` collection is empty or unavailable. */
export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'cleaning',
    slug: 'cleaning',
    titleKey: 'services.homeCleaning',
    icon: 'sparkles',
    iconBg: 'bg-accent/20',
    iconFg: 'text-text-primary',
    route: 'service',
    order: 1,
    keywords: ['تنظيف', 'cleaning', 'منزل', 'home'],
  },
  {
    id: 'ac',
    slug: 'ac',
    titleKey: 'services.acMaintenance',
    icon: 'wind',
    iconBg: 'bg-border',
    iconFg: 'text-text-secondary',
    route: 'service',
    order: 2,
    keywords: ['تكييف', 'ac', 'صيانة', 'maintenance'],
  },
  {
    id: 'shops',
    slug: 'shops',
    titleKey: 'services.shopContracts',
    icon: 'briefcase',
    iconBg: 'bg-text-secondary/10',
    iconFg: 'text-text-primary',
    route: 'contracts',
    order: 3,
    keywords: ['محلات', 'shop', 'عقود', 'contracts'],
  },
  {
    id: 'hotels',
    slug: 'hotels',
    titleKey: 'services.hotelContracts',
    icon: 'building2',
    iconBg: 'bg-accent/10',
    iconFg: 'text-text-secondary',
    route: 'contracts',
    order: 4,
    keywords: ['فنادق', 'hotel', 'ضيافة', 'hospitality'],
  },
  {
    id: 'enterprise',
    slug: 'enterprise',
    titleKey: 'services.enterprise',
    icon: 'star',
    iconBg: 'bg-text-primary/8',
    iconFg: 'text-text-primary',
    route: 'contracts',
    order: 5,
    keywords: ['شركات', 'enterprise', 'b2b', 'عقود'],
  },
];

function mapDoc(id: string, data: Record<string, unknown>): ServiceItem {
  const keywords = data.keywords;
  return {
    id,
    slug: (data.slug as string) ?? id,
    titleKey: (data.titleKey as string) ?? `services.${id}`,
    icon: (data.icon as ServiceIconType) ?? 'sparkles',
    iconBg: (data.iconBg as string) ?? 'bg-accent/20',
    iconFg: (data.iconFg as string) ?? 'text-text-primary',
    route: (data.route as ServiceRouteType) ?? 'service',
    order: (data.order as number) ?? 99,
    keywords: Array.isArray(keywords) ? (keywords as string[]) : [],
  };
}

export function useServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const q = query(
      collection(db, 'services'),
      where('active', '==', true),
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        if (snapshot.empty) {
          setServices(DEFAULT_SERVICES);
        } else {
          setServices(
            snapshot.docs
              .map(d => mapDoc(d.id, d.data() as Record<string, unknown>))
              .sort((a, b) => a.order - b.order),
          );
        }
        setLoading(false);
      },
      err => {
        console.error('[useServices]', err);
        setServices(DEFAULT_SERVICES);
        setError('');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { services, loading, error };
}
