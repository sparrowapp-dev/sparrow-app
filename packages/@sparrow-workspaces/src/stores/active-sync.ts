import { writable } from "svelte/store";

type ActiveSyncStatesInterface = {
  isloading: boolean;
  isChangesAvailable: boolean;
};
export const activeSyncStore = writable<Map<string, ActiveSyncStatesInterface>>(
  new Map(),
);

export const updateActiveSyncStates = (
  id: string,
  data: ActiveSyncStatesInterface,
) => {
  activeSyncStore.update((state) => {
    state.set(id, data);
    return state;
  });
};
