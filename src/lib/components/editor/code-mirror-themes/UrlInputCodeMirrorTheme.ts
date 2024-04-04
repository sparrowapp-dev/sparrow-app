import { type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  placeholder,
} from "@codemirror/view";

export const UrlInputTheme = EditorView.theme({
  "&": {
    height: "100%",
    width: "100%",
    flex: "1",
    border: "1px solid #272727",
    borderRadius: "6px",
  },
  ".cm-content": {
    caretColor: "var(--white-color)",
    height: "100%",
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
    border: "2px solid var(--sparrow-blue)",
    borderRadius: "6px",
  },
  ".cm-scroller::-webkit-scrollbar": {
    display: "none",
  },
});

export const UrlInputSetup: Extension = [
  // Enabling line wrapping
  EditorView.lineWrapping,

  // override default behavior of Enter key
  keymap.of([
    { key: "Enter", run: () => true }
  ]),

  // do not allow insertion of new line
  EditorView.updateListener.of(update => {
    if (update.docChanged && update.state.doc.lines > 1) {
      let transaction = update.state.update({ changes: { from: update.state.doc.line(2).from, to: update.state.doc.length } });
      update.view.dispatch(transaction);
    }
  }),

  // set placeholder
  placeholder("Enter URL or paste text"),
];

export type AggregateEnvironment = {
  key: string;
  value: string;
  type: string;
  environment: string;
};
