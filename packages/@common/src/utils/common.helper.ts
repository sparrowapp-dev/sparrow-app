import { WorkspaceRole } from "../enums";
import {
  workspaceLevelPermissions,
  workspaceLevelRolePermisson,
} from "../constants/permissions.constant";
//get path for url
export function getPathFromUrl(url: string) {
  try {
    const sanitizedUrl = url.replace(/\{\{.*?\}\}/g, "");
    const urlObject = new URL(sanitizedUrl);
    return urlObject.pathname;
  } catch (error) {
    console.error("Invalid URL:", url);
  }
  return "";
}

// replace / with >
export function replaceSlashWithGreaterThanSymbol(str: string) {
  const stringWithoutFirstSlash = str.replace(/^\//, "");
  const replacedStringwithoutSlash = stringWithoutFirstSlash.replace(
    /([^/])\//g,
    "$1 > ",
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

interface EventListenersObject {
  eventType: string;
  eventHandler: (event: Event) => void;
}
export function createDynamicComponents(
  elementType: string,
  bootstrapClasses: string,
  eventListeners?: EventListenersObject[],
): HTMLElement {
  const element: HTMLElement = document.createElement(elementType);
  element.setAttribute("class", bootstrapClasses);
  if (eventListeners && eventListeners.length > 0) {
    eventListeners.forEach((listener: EventListenersObject) => {
      element.addEventListener(listener.eventType, listener.eventHandler);
    });
  }
  return element;
}
