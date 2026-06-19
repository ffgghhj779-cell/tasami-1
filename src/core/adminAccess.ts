/** Bootstrap admins — mirrored in Firestore rules until Console seed exists. */
export const BOOTSTRAP_ADMIN_UIDS = [
  'mLHa4QjZOyWEvt1qflTw5fP4Cbw1',
] as const;

export const BOOTSTRAP_ADMIN_EMAILS = [
  'osamakhalil740@gmail.com',
] as const;

export function isBootstrapAdmin(
  uid: string | null | undefined,
  email?: string | null,
): boolean {
  if (uid && (BOOTSTRAP_ADMIN_UIDS as readonly string[]).includes(uid)) return true;
  const normalized = email?.trim().toLowerCase();
  return !!normalized && (BOOTSTRAP_ADMIN_EMAILS as readonly string[]).includes(normalized);
}
