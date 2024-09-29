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
        backgroundColor: "var(--bg-secondary-550)",
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
        color: "var(--text-secondary-200)",
        fontSize: "12px",
        fontWeight: 400,
      },
      "&.cm-editor.cm-focused": {
        border: "1px solid var(--border-primary-300)",
        borderRadius: "4px",
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
