import {
  EditorView,
  keymap,
  highlightSpecialChars,
  highlightActiveLine,
  dropCursor,
  lineNumbers,
  highlightActiveLineGutter,
  rectangularSelection,
  crosshairCursor,
} from "@codemirror/view";
import {
  HighlightStyle,
  defaultHighlightStyle,
  foldKeymap,
  foldGutter,
  indentOnInput,
  bracketMatching,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { type Extension, EditorState } from "@codemirror/state";
import {
  history,
  historyKeymap,
  defaultKeymap,
  indentLess,
  insertTab,
} from "@codemirror/commands";
import {
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
  completionKeymap,
} from "@codemirror/autocomplete";
import {
  searchKeymap,
  highlightSelectionMatches,
  search,
} from "@codemirror/search";
import { lintKeymap, linter } from "@codemirror/lint";
import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";
import {
  jsonSchemaLinter,
  jsonSchemaHover,
  jsonCompletion,
  stateExtensions,
  handleRefresh,
} from "codemirror-json-schema";
import { hoverTooltip } from "@codemirror/view";
import { EditorFont } from "@sparrow/common/constants/fonts.constant";

export const basicTheme = EditorView.theme({
  "&": {
    height: "100%",
    width: "100%",
    flex: "1",
    fontSize: "80%",
  },
  ".cm-content": {
    caretColor: "var(--white-color)",
    height: "100%",
  },
  ".cm-panels": {
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
    borderRight: "0",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
  span: {
    fontFamily: EditorFont,
  },
  div: {
    fontFamily: EditorFont,
    backgroundColor: "transparent",
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

export const basicHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: editorColors.keywordColor },
  {
    tag: t.bracket,
    color: editorColors.bracketColor,
  },
  {
    tag: t.string,
    color: editorColors.stringColor,
  },
  {
    tag: t.number,
    color: editorColors.numberColor,
  },
  {
    tag: t.angleBracket,
    color: editorColors.angleBracket,
  },
  {
    tag: t.typeName,
    color: editorColors.tabColor,
  },
  {
    tag: t.squareBracket,
    color: editorColors.squareBracket,
  },
  {
    tag: [t.name, t.deleted, t.character],
    color: editorColors.basicColor,
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: editorColors.variableColor,
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: editorColors.constantColor,
  },
  {
    tag: [t.definition(t.name), t.separator],
    color: editorColors.separatorColor,
  },
  {
    tag: [
      t.className,
      t.annotation,
      t.modifier,
      t.namespace,
      t.meta,
      t.comment,
    ],
    color: editorColors.infoColor,
  },
  {
    tag: [t.operator, t.operatorKeyword, t.url, t.regexp, t.special(t.string)],
    color: editorColors.operatorColor,
  },
  { tag: t.link, textDecoration: "underline", color: editorColors.linkColor },
  {
    tag: [t.atom, t.bool, t.special(t.variableName)],
    color: editorColors.constantColor,
  },
  { tag: t.invalid, color: editorColors.invalidColor },
]);

export const basicSetup: Extension = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter({
    openText: "▾",
    closedText: "▸",
  }),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(basicHighlightStyle),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
    {
      key: "Tab",
      preventDefault: true,
      run: insertTab,
    },
    {
      key: "Shift-Tab",
      preventDefault: true,
      run: indentLess,
    },
  ]),
  search({
    top: true,
  }),
];

export const jsonSetup: Extension = [
  closeBrackets(),
  json(),
  linter(jsonParseLinter(), {
    delay: 300,
  }),
  linter(jsonSchemaLinter(), {
    needsRefresh: handleRefresh,
  }),
  jsonLanguage.data.of({
    autocomplete: jsonCompletion(),
  }),
  hoverTooltip(jsonSchemaHover()),
  stateExtensions(),
];
