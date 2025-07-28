import { EditorView } from "@codemirror/view";

export class PromptInputTheme {
  private theme;

  constructor() {
    this.theme = EditorView.theme({
      // Root container of the editor
      "&": {
        height: "150px",
        width: "100%",
        flex: "1",
        borderRadius: "4px",
        fontSize: "12px",
        overflow: "hidden",
        backgroundColor: "var(--bg-ds-surface-400)",
      },

      // Editable content area
      ".cm-content": {
        caretColor: "var(--border-primary-300)",
        backgroundColor: "var(--bg-ds-surface-400)",
        padding: "8px",
        fontSize: "12px",
        fontWeight: "500",
        color: "inherit",
        minHeight: "100%",
        maxHeight: "164px",
        borderRadius: "4px",
        overflowY: "auto",
        overflowX: "hidden",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        display: "block",
        boxSizing: "border-box",
        cursor: "text",
      },

      // Each line of text
      ".cm-line": {
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        width: "100%",
        boxSizing: "border-box",
        minHeight: "20px",
      },

      // Scrollable container
      ".cm-scroller": {
        overflowX: "hidden !important",
        overflowY: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      },

      // Placeholder style
      ".cm-placeholder": {
        color: "var(--text-secondary-200)",
        fontSize: "12px",
        lineHeight: "20px",
      },

      // Webkit scrollbar (vertical only)
      ".cm-scroller::-webkit-scrollbar": {
        width: "8px",
        height: "0px !important",
      },
      ".cm-scroller::-webkit-scrollbar-thumb": {
        backgroundColor: "var(--border-ds-neutral-300)",
        borderRadius: "8px",
      },
      ".cm-scroller::-webkit-scrollbar-horizontal": {
        display: "none !important",
        height: "0 !important",
      },

      // Editor wrapper state
      "&.cm-editor": {
        border: "1px solid transparent",
        borderRadius: "4px",
        outline: "none",
        resize: "none",
        minHeight: "36px",
        maxHeight: "164px",

        "&:hover": {
          outline: "1px solid var(--border-ds-neutral-300)", // hoveredBorderColor
        },
        "&.cm-focused": {
          outline: "1px solid var(--border-ds-primary-300)", // focusedBorderColor
        },
      },

      // Focused behavior
      "&.cm-focused .cm-scroller": {
        whiteSpace: "pre-wrap !important",
        wordBreak: "break-word !important",
        overflowX: "hidden !important",
        overflowY: "auto !important",
        maxHeight: "164px !important",
        width: "100% !important",
      },

      "&.cm-focused .cm-content": {
        whiteSpace: "pre-wrap !important",
        wordBreak: "break-word !important",
        maxHeight: "164px !important",
        width: "100% !important",
      },

      "&.cm-focused .cm-line": {
        width: "100% !important",
        maxWidth: "100% !important",
        display: "block !important",
        boxSizing: "border-box !important",
        paddingRight: "10px !important",
      },
    });
  }

  public build() {
    return this.theme;
  }
}
