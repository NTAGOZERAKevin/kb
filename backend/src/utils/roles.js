// Two dashboard roles exist:
//   owner - the site owner. Same business access as an admin, plus the exclusive
//           right to grant or remove admin access.
//   admin - a trusted helper who runs the shop but cannot touch team access.
export const ADMIN_ROLES = ['owner', 'admin'];

export function isAdmin(user) {
  return ADMIN_ROLES.includes(user?.role);
}

export function isOwner(user) {
  return user?.role === 'owner';
}
