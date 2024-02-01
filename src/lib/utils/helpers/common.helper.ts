import { WorkspaceRole } from "../enums";
import {
  workspaceLevelPermissions,
  workspaceLevelRolePermisson,
} from "../constants/permissions.constant";
//get path for url
export function getPathFromUrl(url: string) {
  try {
    const urlObject = new URL(url);
    return urlObject.pathname;
  } catch (error) {
    console.error("Invalid URL:", url);
  }
}

// replace / with >
export function replaceSlashWithGreaterThanSymbol(str: string) {
  const stringWithoutFirstSlash = str.replace(/^\//, "");
  const replacedStringwithoutSlash = stringWithoutFirstSlash.replace(
    /([^/])\//g,
    "$1>",
  );

  return replacedStringwithoutSlash;
}
//handle workspace level permissson based on role
export function hasWorkpaceLevelPermission(
  userRole: WorkspaceRole,
  requiredPermission: workspaceLevelPermissions,
) {
  const allowedPermissions = workspaceLevelRolePermisson[userRole] || [];
  return allowedPermissions.includes(requiredPermission);
}
