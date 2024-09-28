import type { CurrentWorkspace } from "@deprecate/utils/interfaces/workspace.interface";
import { writable } from "svelte/store";
export const isWorkspaceCreatedFirstTime = writable(false);
export const isWorkspaceLoaded = writable(true);
export const workspaceView = writable("Grid");

export const workspaceLeftPanelWidth = writable(20);
export const workspaceRightPanelWidth = writable(80);

/**
 * The writable store containing the current workspace information.
 * @type {import("svelte/store").Writable<CurrentWorkspace>}
 * @deprecated
 */
const currentWorkspace = writable<CurrentWorkspace>({
  name: "",
  id: "",
});

/**
 * Sets the current workspace with the provided id and name (force over writes)..
 * @deprecated
 */
const setCurrentWorkspace = (
  workspaceId: string,
  workspaceName: string,
): void => {
  currentWorkspace.set({ id: workspaceId, name: workspaceName });
};

/**
 * Sets the current workspace with the provided id and name (do not over writes)..
 * @deprecated
 */
const updateCurrentWorkspace = (
  workspaceId: string,
  workspaceName: string,
): void => {
  currentWorkspace.update((elem: CurrentWorkspace) => {
    if (!elem.name && !elem.id) {
      elem.id = workspaceId;
      elem.name = workspaceName;
    }
    return elem;
  });
};

export { currentWorkspace, setCurrentWorkspace, updateCurrentWorkspace };
