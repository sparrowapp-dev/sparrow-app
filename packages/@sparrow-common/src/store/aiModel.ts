import { writable } from "svelte/store";

/**
 * Simple store mapping teamId => selected model (string).
 * Exposes only an update function and a synchronous getter.
 */

export const aiModelByTeam = writable<Map<string, string>>(new Map());

export const updateModelForTeam = (teamId: string, model: string) => {
  debugger;
  aiModelByTeam.update((current) => {
    const next = new Map(current);
    next.set(teamId, model);
    return next;
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
