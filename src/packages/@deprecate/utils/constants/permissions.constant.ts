import { WorkspaceRole } from "../enums";

export const PERMISSION_NOT_FOUND_TEXT =
  "You are not allowed to perform this action!";

export const AdminLevelPermission = [
  "Create New Workspaces.",
  "Send Invites.",
  "Change role of Admin and Members.",
  "View/edit all the workspaces in the team.",
  "See all the user, their email and roles.",
  "See access details of a user.",
];
export enum workspaceLevelPermissions {
  WORKSPACE_SETTING = "workspace setting",
  EDIT_WORKSPACE = "edit workspace",
  SEND_INVITE = "send invite",
  REST_API_TOOL_ACCESS = "rest api tool access",
  SAVE_REQUEST = "save request",
  ADD_FOLDER = "add folder",
  ADD_COLLECTIONS = "add collection",
  EDIT_API_DESC = "edit api description",
  EDIT_FOLDER_DESC = "edit folder description",
  EDIT_COLLECTION_DESC = "edit collection description",
  ACTIVE_SYNC = "active sync",
  ADD_ENVIRONMENT = "add environment",
  EDIT_ENVIRONMENT = "edit environment",
  SWITCH_ENVIRONMENT = "switch environment",
  USE_ENV_VARIABLE = "use env variables",
}
export const workspaceLevelRolePermisson = {
  [WorkspaceRole.WORKSPACE_ADMIN]: [
    workspaceLevelPermissions.WORKSPACE_SETTING,
    workspaceLevelPermissions.EDIT_WORKSPACE,
    workspaceLevelPermissions.SEND_INVITE,
    workspaceLevelPermissions.REST_API_TOOL_ACCESS,
    workspaceLevelPermissions.SAVE_REQUEST,
    workspaceLevelPermissions.ADD_COLLECTIONS,
    workspaceLevelPermissions.ADD_FOLDER,
    workspaceLevelPermissions.EDIT_API_DESC,
    workspaceLevelPermissions.EDIT_FOLDER_DESC,
    workspaceLevelPermissions.EDIT_COLLECTION_DESC,
    workspaceLevelPermissions.ACTIVE_SYNC,
    workspaceLevelPermissions.ADD_ENVIRONMENT,
    workspaceLevelPermissions.EDIT_ENVIRONMENT,
    workspaceLevelPermissions.SWITCH_ENVIRONMENT,
    workspaceLevelPermissions.USE_ENV_VARIABLE,
  ],
  [WorkspaceRole.WORKSPACE_EDITOR]: [
    workspaceLevelPermissions.EDIT_WORKSPACE,
    workspaceLevelPermissions.REST_API_TOOL_ACCESS,
    workspaceLevelPermissions.SAVE_REQUEST,
    workspaceLevelPermissions.ADD_COLLECTIONS,
    workspaceLevelPermissions.ADD_FOLDER,
    workspaceLevelPermissions.EDIT_API_DESC,
    workspaceLevelPermissions.EDIT_FOLDER_DESC,
    workspaceLevelPermissions.EDIT_COLLECTION_DESC,
    workspaceLevelPermissions.ACTIVE_SYNC,
    workspaceLevelPermissions.ADD_ENVIRONMENT,
    workspaceLevelPermissions.EDIT_ENVIRONMENT,
    workspaceLevelPermissions.SWITCH_ENVIRONMENT,
    workspaceLevelPermissions.USE_ENV_VARIABLE,
  ],
  [WorkspaceRole.WORKSPACE_VIEWER]: [
    workspaceLevelPermissions.REST_API_TOOL_ACCESS,
    workspaceLevelPermissions.SWITCH_ENVIRONMENT,
    workspaceLevelPermissions.USE_ENV_VARIABLE,
  ],
};
