import type { TFDataStoreType } from "@sparrow/common/types/workspace/testflow";
import { writable } from "svelte/store";

export interface DynamicExpressionContent {
  id: string;
  blockName: string;
  requestType: string;
  key: string;
  value: string;
  method: string;
  index: number;
  cursor?: number;
  isCurrentOpen: boolean;
}

export interface RequestBodyCursorPosition {
  blockName: string;
  cursor: number;
}

export const testFlowDataStore = writable<Map<string, TFDataStoreType>>(
  new Map(),
);

export const isDynamicExpressionModalOpen = writable(false);

export const selectedRequestTypes = writable({});

export const isDynamicExpressionContent = writable<DynamicExpressionContent[]>(
  [],
);

export const requestBodyCursorPosition = writable<RequestBodyCursorPosition[]>(
  [],
);

//This function will add the content into the store of Dynamic expression content.
export const addDynamicExpressionContent = (
  id: string,
  blockName: string,
  requestType: string,
  key: string,
  value: string,
  method: string,
  index: number,
  isCurrentOpen: boolean,
  cursor?: number,
) => {
  isDynamicExpressionContent.update((items) => {
    const itemIndex = items.findIndex(
      (item) =>
        item.id === id &&
        item.blockName === blockName &&
        item.requestType === requestType &&
        item.method === method &&
        item.key === key &&
        item.index === index,
    );
    if (itemIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], value };
      return updatedItems;
    } else {
      return [
        ...items,
        {
          id,
          blockName,
          requestType,
          key,
          value,
          method,
          index,
          cursor,
          isCurrentOpen,
        },
      ];
    }
  });
};

//This function will remove the content from the store of Dynamic expression content.
export const removeDynamicExpressionContent = (
  id: string,
  blockName: string,
  requestType: string,
  method: string,
  key: string,
  index: number,
) => {
  isDynamicExpressionContent.update((items) =>
    items.filter(
      (item) =>
        !(
          item.id === id &&
          item.blockName === blockName &&
          item.requestType === requestType &&
          item.method === method &&
          item.key === key &&
          item.index === index
        ),
    ),
  );
};

export const updateIsCurrentExpression = (
  id: string,
  blockName: string,
  requestType: string,
  method: string,
  key: string,
  index: number,
) => {
  isDynamicExpressionContent.update((items) => {
    return items.map((item) => {
      if (
        item.id === id &&
        item.blockName === blockName &&
        item.requestType === requestType &&
        item.method === method &&
        item.key === key &&
        item.index === index
      ) {
        console.log(
          "data -------------------------->",
          item.id,
          item.blockName,
          item.requestType,
          item.key,
          item.value,
        );
        return { ...item, isCurrentOpen: true };
      }
      return item;
    });
  });
};

export const updateDynamicExpressionValue = (
  id: string,
  blockName: string,
  requestType: string,
  key: string,
  method: string,
  index: number,
  newValue: string,
) => {
  isDynamicExpressionContent.update((items) =>
    items.map((item) => {
      if (
        item.id === id &&
        item.blockName === blockName &&
        item.requestType === requestType &&
        item.key === key &&
        item.method === method &&
        item.index === index
      ) {
        return { ...item, value: newValue };
      }
      return item;
    }),
  );
};
