export interface ModulePermission {
  parent_id: string;
  children_id?: string;
  actions?: string[];
}

export interface PermissionUser {
  role?: string | null;
  permissions?: ModulePermission[];
}

export const isFullAccessRole = (role?: string | null) =>
  ["superadmin", "super admin"].includes(String(role || "").trim().toLowerCase());

export const hasModulePermission = (
  user: PermissionUser | null | undefined,
  parentId: string,
  childId = "",
  action = "view",
) => {
  if (isFullAccessRole(user?.role)) return true;
  const permissions = user?.permissions;
  if (!Array.isArray(permissions)) return false;

  return permissions.some((permission) => {
    if (permission.parent_id !== parentId || (permission.children_id || "") !== childId) return false;
    if (action === "") return true;

    const actions = permission.actions || [];
    // Dashboard is an access-only module. Its permission row intentionally has
    // no action, unlike CRUD modules where `view` must be explicitly granted.
    return parentId === "dashboard" && actions.length === 0
      ? action === "view"
      : actions.includes(action);
  });
};

export interface AreaModuleAccess {
  parentId: string;
  childId?: string;
  action?: string;
}

const formAction = (pathname: string) => {
  if (!pathname.includes("/form")) return "view";
  return /\/form\/[^/]+\/?$/.test(pathname) ? "edit" : "add";
};

export const getAreaModuleAccess = (pathname: string): AreaModuleAccess | null => {
  if (pathname.startsWith("/beesee/ecommerce")) {
    if (pathname.startsWith("/beesee/ecommerce/category")) return { parentId: "category", action: formAction(pathname) };
    if (pathname.startsWith("/beesee/ecommerce/product")) return { parentId: "product", action: formAction(pathname) };
    if (pathname.startsWith("/beesee/ecommerce/team-members")) return { parentId: "users", childId: "list_user", action: formAction(pathname) };
    if (pathname.startsWith("/beesee/ecommerce/position")) return { parentId: "users", childId: "position" };
    if (pathname.startsWith("/beesee/ecommerce/feature-product")) return { parentId: "featured-product", action: formAction(pathname) };
    if (pathname.startsWith("/beesee/ecommerce/dashboard")) return { parentId: "dashboard" };
  }

  return null;
};
