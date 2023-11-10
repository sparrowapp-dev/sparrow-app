import { writable } from "svelte/store";

const currentWorkspace = writable({
  name: "",
  id: "",
});

const setCurrentWorkspace = (workspaceId: string, workspaceName: string) => {
  currentWorkspace.set({
    id: workspaceId,
    name: workspaceName,
  });
};

export { currentWorkspace, setCurrentWorkspace };
