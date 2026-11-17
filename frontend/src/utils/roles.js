// The owner runs the site; admins are trusted helpers the owner has approved.
export const DASHBOARD_ROLES = ['owner', 'admin'];

export function hasDashboardAccess(user) {
  return DASHBOARD_ROLES.includes(user?.role);
}

export function isOwner(user) {
  return user?.role === 'owner';
}
