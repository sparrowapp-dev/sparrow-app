import { EditorView } from "@codemirror/view";
export class UrlInputTheme {
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        height: "36px",
        width: "100%",
        flex: "1",
        borderRadius: "0",
        fontSize: "14px",
      },
      ".cm-content": {
        caretColor: "var(--white-color)",
        height: "100%",
        paddingTop: "7px",
        backgroundColor: "var(--bg-ds-surface-600)",
        "border-radius": "4px",
      },
      ".cm-content::placeholder": {
        color: "red",
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
        "font-size": "14x",
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
      "&.cm-editor:hover": {
        border: "1px solid var(--border-ds-neutral-300)",
        "border-radius": "4px",
      },
      "&.cm-editor.cm-focused": {
        border: "1px solid var(--border-ds-primary-300)",
        "border-radius": "4px",
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
