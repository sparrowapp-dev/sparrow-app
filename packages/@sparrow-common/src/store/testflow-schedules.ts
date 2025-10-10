import { writable } from "svelte/store";

// Create the writable store with an initial empty object
export const testflowSchedules = writable<Map<string | number, any[]>>(new Map());

export const updateTestflowSchedules = (_id: string , _schedules: any[]) => {
  testflowSchedules.update((currentMap) => {
    const updatedMap = new Map(currentMap);
    updatedMap.set(_id, _schedules);
    return updatedMap;
  });
};
