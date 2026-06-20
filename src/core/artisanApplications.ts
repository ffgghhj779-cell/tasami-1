export type ArtisanApplicationStatus = 'pending' | 'approved' | 'rejected' | 'on_hold';

export const ARTISAN_STATUS_LABELS: Record<ArtisanApplicationStatus, string> = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض',
  on_hold: 'معلّق',
};

export const ARTISAN_STATUS_NEXT: Record<
  ArtisanApplicationStatus,
  ArtisanApplicationStatus | null
> = {
  pending: 'approved',
  on_hold: 'approved',
  approved: 'rejected',
  rejected: 'pending',
};

export function artisanStatusActionLabel(status: ArtisanApplicationStatus): string {
  switch (status) {
    case 'pending':
    case 'on_hold':
      return 'قبول الطلب';
    case 'approved':
      return 'رفض الطلب';
    case 'rejected':
      return 'إعادة للمراجعة';
    default:
      return 'تحديث الحالة';
  }
}
