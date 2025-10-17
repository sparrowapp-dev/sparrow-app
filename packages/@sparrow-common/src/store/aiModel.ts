import { writable } from "svelte/store";

/**
 * Simple store mapping teamId => selected model (string).
 * Exposes only an update function and a synchronous getter.
 */

export const aiChatBotModelByTeam = writable<Map<string, string>>(new Map());

export const updateAiChatBotModelforTeam = (teamId: string, model: string) => {
  aiChatBotModelByTeam.update((currentMap) => {
    const updatedMap = new Map(currentMap);
    updatedMap.set(teamId, model);
    return updatedMap;
  });
};

export const getAiChatBotModelForTeam = (
  teamId: string,
): string | undefined => {
  let result: string | undefined;
  const unsub = aiChatBotModelByTeam.subscribe((map) => {
    result = map.get(teamId);
  });
  unsub();
  return result;
};
