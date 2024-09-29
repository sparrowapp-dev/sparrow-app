import { EditorView } from "@codemirror/view";

export class TabularInputTheme {
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        height: "18px",
        width: "100%",
        flex: "1",
        border: "1px solid transparent",
        borderRadius: "0",
        fontSize: "12px",
      },
      ".cm-content": {
        caretColor: "var(--white-color)",
        height: "100%",
        padding: "0",
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
      ".cm-foldPlaceholder": {
        color: "var(--text-primary-100)",
        fontSize: "12px",
        fontWeight: "400",
      },
      ".cm-placeholder": {
        color: "var(--text-secondary-300)",
        fontSize: "12px",
        fontWeight: "400",
      },
      "&.cm-editor.cm-focused": {
        border: "1px solid var(--border-primary-300)",
        backgroundColor: "var(--bg-secondary-500)",
        borderRadius: "0",
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
