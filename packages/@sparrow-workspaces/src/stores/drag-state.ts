import { writable } from "svelte/store";

interface DragState {
  isDragging: boolean;
  isOverForbiddenZone: boolean;
}

const initialState: DragState = {
  isDragging: false,
  isOverForbiddenZone: false,
};

export const dragState = writable<DragState>(initialState);

export const setDragging = (dragging: boolean) => {
  dragState.update((state) => ({
    ...state,
    isDragging: dragging,
    // Reset forbidden zone when drag stops
    isOverForbiddenZone: dragging ? state.isOverForbiddenZone : false,
  }));
};

export const setOverForbiddenZone = (forbidden: boolean) => {
  dragState.update((state) => ({
    ...state,
    isOverForbiddenZone: forbidden,
  }));
};
