import { EditorView } from "@codemirror/view";

export class AuthInputTheme {
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        height: "34px",
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
        overflowY: "auto",
        overflowX: "hidden",
      },
      ".cm-panels": {
        backgroundColor: "var(--blackColor)",
        color: "var(--white-color)",
        zIndex: "1",
      },
      ".cm-line": {
        paddingLeft: "10px",
        paddingRight: "14px",
      },
      ".cm-panels.cm-panels-top": {
        borderBottom: "none",
      },
      ".cm-search label": {
        display: "inline-flex",
        alignItems: "center",
      },
      ".cm-textfield": {
        backgroundColor: "var(--background-color)",
      },
      ".cm-button": {
        backgroundColor: "var(--background-color)",
        color: "var(--white-color)",
        backgroundImage: "none",
        textTransform: "capitalize",
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
      ".cm-placeholder": {
        color: "var(--text-ds-neutral-400)",
        fontSize: "12px",
        fontWeight: 500,
      },
      "&.cm-editor": {
        maxHeight: "164px !important",
        minHeight: "32px !important",

        "&:hover": {
          border: "1px solid var(--border-ds-neutral-300)",
        },
        "&.cm-focused": {
          border: "1px solid var(--border-ds-primary-300)",
          borderRadius: "4px",
          height: "auto !important",
          maxHeight: "164px !important",
          minHeight: "32px !important",
          position: "absolute", // Keep this for expanding behavior
          zIndex: "10",
          width: "100%",
        },
        "&.cm-focused .cm-scroller": {
          overflow: "hidden !important",
        },
        "&.cm-focused .cm-content": {
          whiteSpace: "pre-wrap !important",
          wordBreak: "break-all !important",
          maxHeight: "164px !important",
          minHeight: "32px !important",
          width: "100% !important",
        },
        "&.cm-focused .cm-line": {
          width: "100% !important",
          maxWidth: "100% !important",
          display: "block !important",
          boxSizing: "border-box !important",
          paddingLeft: "10px",
          paddingRight: "14px",
        },
      },
      ".cm-scroller::-webkit-scrollbar": {
        width: "10px",
        height: "0px !important",
      },
      ".cm-scroller::-webkit-scrollbar-thumb": {
        backgroundColor: "var(--border-ds-neutral-300)",
        borderRadius: "8px",
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
