import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

/** Isolated banner — avoids re-rendering route tree on online/offline toggles. */
export const OfflineBanner = memo(function OfflineBanner() {
  const { t } = useTranslation();
  return (
    <div className="gpu-layer bg-danger text-white text-xs font-bold p-2 text-center flex items-center justify-center gap-2 sticky z-50 top-0">
      <WifiOff className="w-4 h-4" />
      {t('common.offlineBanner')}
    </div>
  );
});
