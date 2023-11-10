import { writable } from "svelte/store";

const currentWorkspace = writable({
  name: "",
  id: "",
  // type:"",
});

const setCurrentWorkspace = (workspaceId: string, workspaceName: string) => {
  currentWorkspace.set({
    id: workspaceId,
    name: workspaceName,
    // type:workspaceType
  });
};

export { currentWorkspace, setCurrentWorkspace };
