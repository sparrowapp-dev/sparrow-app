import { EditorView } from "@codemirror/view";

export class MockUrlInputTheme {
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        height: "36px",
        width: "100%",
        flex: "1",
        borderRadius: "0",
        fontSize: "14px",
        overflow: "hidden",
        maxHeight: "164px !important",
      },
      ".cm-content": {
        caretColor: "var(--white-color)",
        height: "auto",
        paddingTop: "7px",
        backgroundColor: "var(--bg-ds-surface-600)",
        maxHeight: "164px !important",
        minHeight: "36px !important",
        borderRadius: "0 4px 4px 0",
        overflowY: "auto",
        overflowX: "hidden",
      },
      ".cm-content::placeholder": {
        color: "var(--background-color)",
      },
      ".cm-panels": {
        backgroundColor: "var(--blackColor)",
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
        backgroundColor: "red",
      },
      ".cm-placeholder": {
        color: "var(--text-ds-neutral-400)",
        "font-size": "14px",
        "line-height": "20px",
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
      ".cm-foldPlaceholder": {
        color: "#8A9299",
        fontSize: "30px",
        fontWeight: "400",
      },
      "&.cm-editor": {
        maxHeight: "164px !important",

        "&:hover": {
          outline: "1px solid var(--border-ds-neutral-300)",
          borderRadius: "4px",
        },
        "&.cm-focused": {
          borderRadius: "4px",
          outline: "1px solid var(--border-ds-primary-300)",
          height: "auto !important",
          maxHeight: "164px !important",
          minHeight: "36px !important",
          position: "absolute",
          zIndex: "10",
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        },
        "&.cm-focused .cm-scroller": {
          whiteSpace: "pre-wrap !important",
          wordBreak: "break-word !important",
          overflowX: "hidden !important",
          overflowY: "auto !important",
          maxHeight: "164px !important",
          width: "100% !important",
        },
        "&.cm-focused .cm-content": {
          whiteSpace: "pre-wrap !important",
          wordBreak: "break-all !important",
          maxHeight: "164px !important",
          width: "100% !important",
        },
        "&.cm-focused .cm-line": {
          width: "100% !important",
          maxWidth: "100% !important",
          display: "block !important",
          boxSizing: "border-box !important",
          paddingRight: "10px !important",
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
