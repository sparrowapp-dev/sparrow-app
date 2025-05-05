import { EditorView } from "@codemirror/view";

export class TestFlowNameTheme {
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        height: "34px", // Fixed height
        width: "100%",
        flex: "1",
        border: "1px solid var(--bg-secondary-600)",
        borderRadius: "4px",
        fontSize: "12px",
      },
      ".cm-content": {
        caretColor: "var(--white-color)",
        height: "100%",
        paddingTop: "8px",
        borderRadius: "4px",
        backgroundColor: "var(--bg-ds-surface-600)",
        overflowY: "hidden", // Prevent vertical scrolling
        overflowX: "hidden",
        whiteSpace: "nowrap !important", // Ensure single-line behavior
        overflow: "hidden !important", // Hide overflow content
        textOverflow: "ellipsis !important", // Apply text truncation
        width: "100% !important", // Ensure it takes the full width of the container
        maxWidth: "100% !important", // Prevent it from exceeding the container width
        display: "block !important", // Ensure block-level behavior
      },
      ".cm-line": {
        paddingLeft: "10px",
        paddingRight: "14px",
        whiteSpace: "nowrap !important", // Ensure single-line behavior
        overflow: "hidden !important", // Hide overflow content
        textOverflow: "ellipsis !important", // Apply text truncation
        width: "100% !important",
        maxWidth: "100% !important",
        display: "block !important",
      },
      ".cm-placeholder": {
        color: "var(--text-ds-neutral-400)",
        fontSize: "12px",
        fontWeight: 500,
      },
      "&.cm-editor": {
        height: "34px !important", // Fixed height for the editor
        "&:hover": {
          border: "1px solid var(--border-ds-neutral-300)",
        },
        "&.cm-focused": {
          border: "1px solid var(--border-ds-primary-300)",
          borderRadius: "4px",
          height: "34px !important", // Fixed height for the focused state
          position: "absolute", // Keep this for expanding behavior
          zIndex: "10",
          width: "100%",
        },
        "&.cm-focused .cm-scroller": {
          overflow: "hidden !important",
        },
        "&.cm-focused .cm-content": {
          whiteSpace: "nowrap !important", // Ensure single-line behavior
          overflow: "hidden !important", // Hide overflow content
          textOverflow: "ellipsis !important", // Apply text truncation
          height: "34px !important", // Fixed height for content
          width: "100% !important",
        },
        "&.cm-focused .cm-line": {
          whiteSpace: "nowrap !important", // Ensure single-line behavior
          overflow: "hidden !important", // Hide overflow content
          textOverflow: "ellipsis !important", // Apply text truncation
          width: "100% !important",
          maxWidth: "100% !important",
          display: "block !important",
          boxSizing: "border-box !important",
          paddingLeft: "10px",
          paddingRight: "14px",
        },
      },
    });
  }

  public build() {
    return this.theme;
  }
}