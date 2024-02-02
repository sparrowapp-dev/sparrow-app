import {
  EditorView,
  highlightSpecialChars,
  highlightActiveLine,
  dropCursor,
  highlightActiveLineGutter,
  rectangularSelection,
  crosshairCursor,
} from "@codemirror/view";
import {
  HighlightStyle,
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { type Extension, EditorState } from "@codemirror/state";
import { history } from "@codemirror/commands";
import { autocompletion } from "@codemirror/autocomplete";
import { highlightSelectionMatches } from "@codemirror/search";

export const InputTheme = EditorView.theme({
  "&": {
    height: "100%",
    width: "100%",
    flex: "1",
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
    border: "none",
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
    // backgroundColor: "var(--divider-light-color)",
    color: "#8A9299",
    fontSize: "12px",
    fontWeight: "400",
    // borderColor: "var(--divider-dark-color)",
  },
});

const editorColors = {
  basicColor: "var(--editor-name)",
  operatorColor: "var(--editor-name)",
  invalidColor: "var(--editor-operator)",
  separatorColor: "var(--sparrow-blue)",
  infoColor: "var(--success-color)",
  variableColor: "var(--editor-variable)",
  linkColor: "var(--sparrow-blue)",
  constantColor: "var(--editor-bool)",
  keywordColor: "var(--editor-name)",
  bracketColor: "var(--white-color)",
  squareBracket: "var(--editor-square-bracket)",
  numberColor: "var(--editor-number)",
  angleBracket: "var(--editor-angle-bracket)",
  tabColor: "var(--editor-tag-color)",
  stringColor: "var(--editor-string-color)",
};

export const inputHighlightStyle = HighlightStyle.define([
  // { tag: t.keyword, color: editorColors.keywordColor },
  // {
  //   tag: t.bracket,
  //   color: editorColors.bracketColor,
  // },
  // {
  //   tag: t.regexp('/{{\w+}}/')
  // }
  //   {
  //     tag: t.string,
  //     color: editorColors.stringColor,
  //   },
  {
    tag: t.number,
    color: editorColors.numberColor,
  },

  //   {
  //     tag: t.angleBracket,
  //     color: editorColors.angleBracket,
  //   },
  //   {
  //     tag: t.typeName,
  //     color: editorColors.tabColor,
  //   },
  //   {
  //     tag: t.squareBracket,
  //     color: editorColors.squareBracket,
  //   },
  //   {
  //     tag: [t.name, t.deleted, t.character],
  //     color: editorColors.basicColor,
  //   },
  //   {
  //     tag: [t.function(t.variableName), t.labelName],
  //     color: editorColors.variableColor,
  //   },
  //   {
  //     tag: [t.color, t.constant(t.name), t.standard(t.name)],
  //     color: editorColors.constantColor,
  //   },
  //   {
  //     tag: [t.definition(t.name), t.separator],
  //     color: editorColors.separatorColor,
  //   },
  //   {
  //     tag: [
  //       t.className,
  //       t.annotation,
  //       t.modifier,
  //       t.namespace,
  //       t.meta,
  //       t.comment,
  //     ],
  //     color: editorColors.infoColor,
  //   },
  //   {
  //     tag: [t.operator, t.operatorKeyword, t.url, t.regexp, t.special(t.string)],
  //     color: editorColors.operatorColor,
  //   },
  //   { tag: t.link, textDecoration: "underline", color: editorColors.linkColor },
  //   {
  //     tag: [t.atom, t.bool, t.special(t.variableName)],
  //     color: editorColors.constantColor,
  //   },
  //   { tag: t.invalid, color: editorColors.invalidColor },
]);

// styleTags;

// export const matchhighlight = HighlightStyle.define()

export const inputSetup: Extension = [
  // lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  // foldGutter({
  //   openText: "▾",
  //   closedText: "▸",
  // }),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(inputHighlightStyle),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  // selectAll()
  // search({ regexp: true }),
  // minChars: 2,
  // showToken: /\w/,
  // style:'matchhighlight',
  // annotateScrollbar: true
  // }
  //   keymap.of([
  //     ...closeBracketsKeymap,
  //     ...defaultKeymap,
  //     ...searchKeymap,
  //     ...historyKeymap,
  //     ...foldKeymap,
  //     ...completionKeymap,
  //     ...lintKeymap,
  //   ]),
  // search({
  //   top: true,
  // }),
];

export type AggregateEnvironment = {
  key: string;
  value: string;
  type: string;
  environment: string;
  // sourceEnv: string;
};
