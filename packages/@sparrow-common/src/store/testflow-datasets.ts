import { writable } from "svelte/store";

/**
 * Map key: string | number (e.g. testflow id, workspace id, tab id)
 * Map value: array of dataset objects (your payload example)
 */
export const testflowDataSets = writable<Map<string | number, any[]>>(
  new Map(),
);

export const updateTestflowDataSets = (
  _id: string | number,
  _datasets: any[],
) => {
  testflowDataSets.update((current) => {
    const updated = new Map(current);
    updated.set(_id, _datasets);
    return updated;
  });
};
