import { writable } from "svelte/store";

export const inviteModalStore = writable<{
  show: boolean;
  data: {
    teamName: string;
    role: string;
    workspaceNames: string[];
  } | null;
}>({
  show: false,
  data: null,
});
