import { EditorView } from "@codemirror/view";

export class TabularInputTheme{
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        height: "27px",
        width: "100%",
        flex: "1",
        border: "1px solid transparent",
        borderRadius: "0",
        fontSize: "12px",
        lineHeight: "130%",
        fontWeight: "500",
        carotColor:"var(--bg-ds-primary-300)",
        maxHeight: "164px !important",
      },
      ".cm-content": {
        caretColor: "var(--white-color)",
        height: "auto",
        maxHeight: "164px !important",
        padding: "4px",
        color: "var(--text-ds-neutral-50)",
      },
      ".cm-panels": {
        backgroundColor: "var(--bg-ds-surface-400)",
        color: "var(--white-color)",
        zIndex: "1",
      },
      ".cm-panels.cm-panels-top": {
        borderBottom: "none",
      },
      ".cm-search label": {
        display: "inline-flex",
        alignItems: "center",
      },
      ".cm-textfield": {
        backgroundColor: "var(--background-color)"
      },
      ".cm-button": {
        backgroundColor: "var(--background-color)",
        color: "var(--white-color)",
        backgroundImage: "none",
        border: "none",
      },
      ".cm-completionLabel": {
        color: "var(--white-color)",
      },
      ".cm-tooltip": {
        backgroundColor: "var(--background-color)",
        border: "none",
      },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-gutters": {
        backgroundColor: "var(--background-color)",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
      },
      ".cm-foldPlaceholder": {
        color: "var(--text-primary-100)",
        fontSize: "12px",
        fontWeight: "400",
      },
      ".cm-placeholder": {
        color: "var(--text-ds-neutral-400)",
        fontSize: "12px",
        fontWeight: "400",
      },
      "&.cm-editor": {
        border: "1px solid transparent",
        // borderRadius: "4px",
        maxHeight: "164px !important",
        carotColor:"var(--bg-ds-primary-300)",
       
        "&.cm-focused": {
          carotColor:"var(--bg-ds-primary-300)",
          border: "1px solid var(--border-ds-primary-300) !important",
          backgroundColor: "var(--bg-ds-surface-400)",
          // borderRadius: "4px",
          width: "100%",
          height: "auto !important",
          maxHeight: "165px !important", // Increased max height
          minHeight: "27px !important", // Keep minimum height
          overflowX: "hidden !important",
          overflowY: "auto !important",
          transformOrigin: "top", // Grow from top down
          zIndex: "10", // Ensure it's above other content
          position: "absolute",
        },
        "&.cm-focused .cm-scroller": {
          whiteSpace: "pre-wrap !important",
          wordBreak: "break-word !important",
          overflowX: "hidden !important",
          overflowY: "auto !important",
          // height: "auto !important",
          maxHeight: "164px !important",
          width: "100% !important",
        },
        "&.cm-focused .cm-content": {
          whiteSpace: "pre-wrap !important",
          wordBreak: "break-all !important",
          // height: "auto !important",
          maxHeight: "164px !important",
          width: "100% !important",
          
        },
        "&.cm-focused .cm-line": {
          width: "100% !important",
          maxWidth: "100% !important",
          display: "block !important",
          boxSizing: "border-box !important",
          paddingRight: "10px !important",
          maxHeight: "164px !important",
        },
        "&:hover": {
          border: "1px solid var(--border-ds-neutral-300)",
          backgroundColor: "var(--bg-ds-surface-400)",
          // borderRadius: "4px",
        },
        "&.cm-focus-invisible": {
          border: "2px solid var(--border-ds-primary-300) !important",
          // borderRadius: "4px",
          backgroundColor: "var(--bg-ds-surface-400)",
        },
      },
      ".cm-scroller::-webkit-scrollbar": {
        width: "6px",
        height: "0px !important",
        display: "block",
      },
      ".cm-scroller::-webkit-scrollbar-thumb": {
        backgroundColor: "var(--border-ds-neutral-300)",
        borderRadius: "3px",
      },
      ".cm-scroller::-webkit-scrollbar-horizontal": {
        display: "none !important",
        height: "0 !important",
      },
    });
  }

  public build() {
    return this.theme;
  }
}
