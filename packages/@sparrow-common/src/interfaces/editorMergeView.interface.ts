
export interface MergeChange {
  from: number; // Start position in the document
  to: number; // End position in the document
  type: "added" | "removed"; // Type of change
  element: Element; // DOM element representing the change
  elements?: Element[]; // All DOM elements in one change group
}