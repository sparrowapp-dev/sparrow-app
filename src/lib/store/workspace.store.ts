import { writable } from "svelte/store";

const currentWorkspace = writable({
  name: "",
  id: "",
});

const setCurrentWorkspace = (workspaceId, workspaceName) => {
  currentWorkspace.set({ id: workspaceId, name: workspaceName });
};

export { currentWorkspace, setCurrentWorkspace };
