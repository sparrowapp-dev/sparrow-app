import { EditorView } from "@codemirror/view";

export const InputTheme = EditorView.theme({
  "&": {
    height: "100%",
    width: "100%",
    flex: "1",
    border: "1px solid #272727",
    borderRadius: "0",
    fontSize: "80%",
  },
  ".cm-content": {
    caretColor: "var(--white-color)",
    height: "100%",
    paddingTop: "7px",
    backgroundColor: "var(--bg-primary-600)",
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
    color: "#8A9299",
    fontSize: "10px",
    fontWeight: "400",
  },
  "&.cm-editor.cm-focused": {
    border: "1px solid var(--sparrow-blue)",
    borderRadius: "0",
  },
  ".cm-scroller::-webkit-scrollbar": {
    display: "none",
  },
});

export type AggregateEnvironment = {
  key: string;
  value: string;
  type: string;
  environment: string;
};
