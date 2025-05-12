 import { EditorView } from "@codemirror/view";

export class TestFlowNameTheme {
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
        backgroundColor: "var(--bg-ds-surface-600)",
        overflowY: "auto", 
        overflowX: "hidden",
        whiteSpace: "nowrap !important", 
        textOverflow: "ellipsis !important", 
        width: "100% !important",
      },
      ".cm-line": {
        paddingLeft: "10px",
        paddingRight: "14px",
        whiteSpace: "nowrap !important", 
        overflow: "hidden !important", 
        textOverflow: "ellipsis !important", 
        width: "100% !important",
      },
      ".cm-placeholder": {
        color: "var(--text-ds-neutral-400)",
        fontSize: "12px",
        fontWeight: 500,
      },
      "&.cm-editor": {
        maxHeight: "164px !important",
        minHeight: "32px !important",
        "&:hover": {
          border: "1px solid var(--border-ds-neutral-300)",
        },
        "&.cm-focused": {
          border: "1px solid var(--border-ds-primary-300)",
          borderRadius: "4px",
          height: "auto !important",
          maxHeight: "164px !important",
          minHeight: "32px !important", 
          position: "absolute", 
          zIndex: "10",
          width: "100%",
        },
        "&.cm-focused .cm-scroller": {
          overflow: "hidden !important",
        },
       "&.cm-focused .cm-content": {
          whiteSpace: "pre-wrap !important", 
          wordBreak: "break-word !important", 
          overflowY: "auto", 
          overflowX: "hidden",
          textOverflow: "clip !important", 
          maxHeight: "164px !important",
          minHeight: "32px !important",
          width: "100% !important",
        },
        "&.cm-focused .cm-line": {
          whiteSpace: "pre-wrap !important",
          overflow: "visible !important", 
          textOverflow: "clip !important",
          width: "100% !important",
          maxWidth: "100% !important",
          display: "block !important",
          boxSizing: "border-box !important",
          paddingLeft: "10px",
          paddingRight: "14px",
        },
      },
    });
  }

  public build() {
    return this.theme;
  }
}