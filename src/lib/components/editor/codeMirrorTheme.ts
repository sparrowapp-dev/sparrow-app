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
import { history, historyKeymap, defaultKeymap } from "@codemirror/commands";
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
export const baseTheme = EditorView.theme({
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
    backgroundColor: "var(--background-color)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
});

const editorBasicColor = "var(--editor-name)";
const editorOperatorColor = "var(--editor-name)";
const editorInvalidColor = "var(--editor-operator)";
const editorSeparatorColor = "var(--sparrow-blue)";
const editorInfoColor = "var(--success-color)";
const editorVariableColor = "var(--editor-variable)";
const editorLinkColor = "var(--sparrow-blue)";
const editorConstantColor = "var(--editor-bool)";
const editorKeywordColor = "var(--editor-name)";
const editorBracketColor = "var(--editor-bracket)";
const editorSquareBracket = "var(--edior-square-bracket)";

export const baseHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: editorKeywordColor },
  {
    tag: t.bracket,
    color: editorBracketColor,
  },
  {
    tag: t.squareBracket,
    color: editorSquareBracket,
  },
  {
    tag: [t.name, t.deleted, t.character],
    color: editorBasicColor,
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: editorVariableColor,
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: editorConstantColor,
  },
  { tag: [t.definition(t.name), t.separator], color: editorSeparatorColor },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.annotation,
      t.modifier,
      t.namespace,
    ],
    color: editorInfoColor,
  },
  { tag: t.number, color: editorSquareBracket },
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.regexp,
      t.link,
      t.special(t.string),
    ],
    color: editorOperatorColor,
  },
  { tag: [t.meta, t.comment], color: editorInfoColor },
  { tag: t.link, textDecoration: "underline", color: editorLinkColor },
  {
    tag: [t.atom, t.bool, t.special(t.variableName)],
    color: editorConstantColor,
  },
  { tag: t.invalid, color: editorInvalidColor },
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
  syntaxHighlighting(baseHighlightStyle),
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
