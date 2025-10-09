import { writable } from "svelte/store";

/**
 * Simple store mapping teamId => selected model (string).
 * Exposes only an update function and a synchronous getter.
 */

export const aiModelByTeam = writable<Map<string, string>>(new Map());

export const updateModelForTeam = (teamId: string, model: string) => {
  aiModelByTeam.update((currentMap) => {
    const updatedMap = new Map(currentMap);
    updatedMap.set(teamId, model);
    return updatedMap;
  });
};

export const getModelForTeam = (teamId: string): string | undefined => {
  let result: string | undefined;
  const unsub = aiModelByTeam.subscribe((map) => {
    result = map.get(teamId);
  });
  unsub();
  return result;
};
