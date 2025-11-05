import { writable } from "svelte/store";

export const isTeamDowngradePopupDismissed = writable<Map<string, boolean>>(
  new Map(),
);

export const setTeamDowngradePopupDismissed = (
  hubId: string,
  dismissed: boolean,
) => {
  isTeamDowngradePopupDismissed.update((currentMap) => {
    const updated = new Map(currentMap);
    updated.set(hubId, dismissed);
    return updated;
  });
};

export const getTeamDowngradePopupDismissed = (hubId: string): boolean => {
  let result = false;
  const unsub = isTeamDowngradePopupDismissed.subscribe((map) => {
    result = map.get(hubId) ?? false;
  });
  unsub();
  return result;
};
