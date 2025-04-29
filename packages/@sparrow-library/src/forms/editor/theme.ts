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
    backgroundColor: "var(--bg-ds-surface-900)",
    borderRadius: "8px",
    color: "var(--white-color)",
    zIndex: "1",
  },
  ".cm-panels.cm-panels-top": {
    borderBottom: "none",
  },
  ".cm-search label": {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
  },
  ".cm-panel.cm-search label": {
    color: "var(--text-ds-neutral-200)",
    fontFamily: "Inter, sans-serif",
    fontWeight: "500",
    fontSize: "12px",
    lineHeight: "1.3",
  },
  ".cm-panel.cm-search": {
    backgroundColor: "var(--bg-ds-surface-600)",
    borderRadius: "4px",
    display: "flex",
    whiteSpace: "normal !important",
    flexWrap: "wrap",
  },
  ".cm-panel.cm-search br": {
    display: "block",
    flexBasis: "100%",
    content: "''",
  },
  ".cm-textfield": {
    width: "198px",
    height: "28px",
    borderRadius: "4px",
    fontSize: "12px",
    color: "var(--text-ds-neutral-50)",
    backgroundColor: "var(--bg-ds-surface-400)",
    border: "none",
  },
  ".cm-textfield:hover": {
    outline: "1px solid var(--border-ds-neutral-300)",
  },
  ".cm-textfield:focus": {
    outline: "1px solid var(--border-ds-primary-300)",
  },
  ".cm-button": {
    backgroundColor: "var(--bg-ds-surface-300)",
    borderRadius: "4px",
    color: "var(--bg-ds-neutral-50)",
    fontFamily: "Inter, sans-serif",
    fontWeight: "500",
    fontSize: "12px",
    backgroundImage: "none",
    height: "28px",
    textTransform: "capitalize",
    border: "none",
  },
  ".cm-button:hover": {
    backgroundColor: "var(--bg-ds-surface-100)",
  },
  ".cm-button:active": {
    backgroundColor: "var(--bg-ds-surface-400)",
    backgroundImage: "none",
    color: "var(--text-ds-neutral-50)",
  },
  ".cm-panel label input[type=checkbox]": {
    appearance: "none",
    cursor: "pointer",
    height: "24px",
    width: "24px",
    display: "inline-block",
    verticalAlign: "middle",
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,<svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M0 2.5C0 1.11929 1.11929 0 2.5 0H9.5C10.8807 0 12 1.11929 12 2.5V9.5C12 10.8807 10.8807 12 9.5 12H2.5C1.11929 12 0 10.8807 0 9.5V2.5ZM2.5 1C1.67157 1 1 1.67157 1 2.5V9.5C1 10.3284 1.67157 11 2.5 11H9.5C10.3284 11 11 10.3284 11 9.5V2.5C11 1.67157 10.3284 1 9.5 1H2.5Z' fill='%23B6B7B9'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
  ".cm-panel label input[type=checkbox]:hover": {
    backgroundColor: "var(--bg-ds-surface-300)",
    borderRadius: "4px",
  },
  ".cm-panel label input[type=checkbox]:checked": {
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,<svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M2.5 0C1.11929 0 0 1.11929 0 2.5V9.5C0 10.8807 1.11929 12 2.5 12H9.5C10.8807 12 12 10.8807 12 9.5V2.5C12 1.11929 10.8807 0 9.5 0H2.5ZM8.85355 4.85355L5.35355 8.35355C5.15829 8.54882 4.84171 8.54882 4.64645 8.35355L3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645C3.34171 5.95118 3.65829 5.95118 3.85355 6.14645L5 7.29289L8.14645 4.14645C8.34171 3.95118 8.65829 3.95118 8.85355 4.14645C9.04882 4.34171 9.04882 4.65829 8.85355 4.85355Z' fill='%23316CF6'/></svg>\")",
  },
  ".cm-panel button[aria-label='close']": {
    fontSize: "24px !important",
    color: "var(--text-ds-neutral-200)",
    height: "24px",
    width: "24px",
  },
  ".cm-completionLabel": {
    color: "var(--white-color)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--background-color)",
    border: "none",
  },
  ".cm-activeLine": { backgroundColor: "var(--bg-ds-surface-600)" },
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
  ".cm-variable-highlight": {
    color: "#D75CA7",
    fontWeight: "bold",
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
