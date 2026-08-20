import React from "react";
import { useLocation } from "react-router-dom";
import NoPermission from "./NoPermission";
import { getAreaModuleAccess, hasModulePermission } from "../../utils/modulePermissions";
import { userAuth } from "../../hooks/userAuth";

const ModulePermissionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { userInfo } = userAuth();
  const access = getAreaModuleAccess(location.pathname);

  // The layout already handles authentication. Wait for the session user to
  // hydrate before evaluating module permissions so a hard refresh does not
  // briefly render the no-permission state for a valid session.
  if (!access || !userInfo || hasModulePermission(userInfo, access.parentId, access.childId || "", access.action || "view")) {
    return <>{children}</>;
  }

  return <NoPermission />;
};

export default ModulePermissionGuard;
