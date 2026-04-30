import type { UserRole } from "@/lib/mock-data";

export const adminRoles: UserRole[] = ["super_admin", "competition_admin"];

export function isAdminRole(role: UserRole) {
  return adminRoles.includes(role);
}

export function isContentManagerRole(role: UserRole) {
  return role === "super_admin" || role === "competition_admin" || role === "content_editor";
}

export function isSuperAdminRole(role: UserRole) {
  return role === "super_admin";
}
