/** Canonical service definitions — slug drives booking serviceType everywhere. */
export interface ServiceConfig {
  slug: string;
  /** Stored on booking / invoice / admin */
  serviceType: string;
  titleKey: string;
  descriptionAr: string;
}

export const SERVICE_CATALOG: Record<string, ServiceConfig> = {
  cleaning: {
    slug: 'cleaning',
    serviceType: 'تنظيف منزلي شامل',
    titleKey: 'services.homeCleaning',
    descriptionAr:
      'نقدم خدمة تنظيف احترافية تشمل جميع الغرف، المطابخ، والحمامات. نستخدم مواد تنظيف آمنة ومعقمات عالية الجودة لضمان بيئة صحية لك ولعائلتك.',
  },
  ac: {
    slug: 'ac',
    serviceType: 'صيانة المكيفات',
    titleKey: 'services.acMaintenance',
    descriptionAr:
      'صيانة دورية وتنظيف عميق لوحدات التكييف، فحص الفريون، تنظيف الفلاتر، وضمان أداء مثالي طوال الصيف.',
  },
};

export function resolveService(slug: string | undefined): ServiceConfig {
  if (slug && SERVICE_CATALOG[slug]) return SERVICE_CATALOG[slug];
  return SERVICE_CATALOG.cleaning;
}
