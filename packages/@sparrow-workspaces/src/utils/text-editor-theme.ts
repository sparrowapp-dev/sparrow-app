import { EditorView } from "@codemirror/view";

export class TextEditorLikeTheme {
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        flex: "1",
        minHeight: "200px",
        backgroundColor: "var(--bg-ds-surface-600)",
        borderRadius: "4px",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        fontSize: "14px",
        gap: "4px",
        overflow: "auto",
        border: "1px solid transparent",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        },

        "&:hover": {
        border: "1px solid white",
        backgroundColor: "var(--bg-secondary-450)",
        },

        "&.cm-focused": {
        border: "1px solid var(--border-ds-primary-300)",
        backgroundColor: "var(--bg-ds-surface-600)",
        outline: "none",
        },

      ".cm-editor": {
        backgroundColor: "transparent",
        borderRadius: "inherit",
        flex: "1",
      },
      ".cm-scroller": {
        overflowY: "auto",
        paddingBottom: "30px",
        backgroundColor: "transparent",
        flex: "1",
      },
      ".cm-content": {
        padding: "0",
        color: "white",
        fontFamily: "inherit",
        backgroundColor: "transparent",
        caretColor: "white",
      },
      ".cm-line": {
        padding: "0",
      },
      ".cm-placeholder": {
        color: "#7a7a7a",
      },
      ".cm-activeLine": {
        backgroundColor: "#333333",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
      },
      ".cm-gutters": {
        display: "none",
      },
      ".cm-tooltip": {
        backgroundColor: "#262626",
        color: "#8e91a4",
        border: "none",
      },
      ".cm-tooltip-autocomplete": {
        backgroundColor: "#262626",
        border: "1px solid #313233",
        borderRadius: "4px",
      },
      ".cm-completionLabel": {
        color: "white",
      },
      ".cm-completionMatchedText": {
        color: "#d35354",
        fontWeight: "bold",
      },
      ".cm-button": {
        backgroundColor: "#313233",
        color: "#8e91a4",
        border: "none",
      },
      ".cm-foldPlaceholder": {
        color: "#8A9299",
      },

      ".cm-scroller::-webkit-scrollbar": {
        width: "6px",
      },
      ".cm-scroller::-webkit-scrollbar-track": {
        background: "transparent",
      },
    });
  }

  public build() {
    return this.theme;
  }
}
