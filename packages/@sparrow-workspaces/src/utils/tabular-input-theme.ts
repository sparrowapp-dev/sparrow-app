import { EditorView } from "@codemirror/view";

export class TabularInputTheme {
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
      },
      ".cm-content": {
        caretColor: "var(--white-color)",
        height: "100%",
        padding: "4px",
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
        borderRadius: "4px",
        "&.cm-focused": {
          border: "1px solid var(--border-ds-primary-300) !important",
          backgroundColor: "var(--bg-ds-surface-400)",
          borderRadius: "4px",
        },

        "&:hover": {
          border: "1px solid var(--border-ds-neutral-300)",
          backgroundColor: "var(--bg-ds-surface-400)",
          borderRadius: "4px",
        },

        "&.cm-focus-invisible": {
          border: "2px solid var(--border-ds-primary-300) !important",
          borderRadius: "4px",
          backgroundColor: "var(--bg-ds-surface-400)",
        },
      },
      ".cm-scroller::-webkit-scrollbar": {
        display: "none",
      },
    });
  }
  public build() {
    return this.theme;
  }
}
