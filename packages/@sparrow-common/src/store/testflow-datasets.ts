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

export const addTestflowDataSet = (_id: string | number, _dataset: any) => {
  let updatedList: any[] = [];
  testflowDataSets.update((current) => {
    const updated = new Map(current);
    const existingDatasets = updated.get(_id) || [];
    updatedList = [...existingDatasets, _dataset];
    updated.set(_id, updatedList);
    return updated;
  });
  return updatedList;
};

export const replaceTestflowDataSet = (_id: string | number, _dataset: any) => {
  debugger;
  let updatedList: any[] = [];
  testflowDataSets.update((current) => {
    const updated = new Map(current);
    const existingDatasets = updated.get(_id) || [];
    updatedList = existingDatasets.map((ds: any) =>
      ds.name === _dataset.name ? _dataset : ds,
    );
    updated.set(_id, updatedList);
    return updated;
  });
  return updatedList;
};
