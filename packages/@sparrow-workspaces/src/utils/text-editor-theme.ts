import { EditorView } from "@codemirror/view";

export class SystemPromptTheme {
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        height: "200px",
        flex: "1",
        borderRadius: "4px",
        backgroundColor: "var(--bg-ds-surface-600)",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        fontSize: "14px",
        gap: "4px",
        overflow: "hidden",           
        border: "1px solid transparent",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      },

      "&:hover": {
        border: "1px solid var(--border-ds-primary-300)",
      },

      "&.cm-focused": {
        border: "1px solid var(--border-ds-primary-300)",
        outline: "none",
      },

      ".cm-editor": {
        backgroundColor: "transparent",
        borderRadius: "inherit",
        flex: "1",
        width: "100%",
        minHeight: "200px",
        maxHeight: "400px",
        height: "auto",
        overflow: "hidden",
        whiteSpace: "pre-wrap",  
        wordBreak: "break-word", 
      },
      ".cm-content": {
        whiteSpace: "pre-wrap !important",
        wordBreak: "break-all !important",
        maxHeight: "164px !important",
        width: "100% !important",
        caretColor: "white",
      },
      ".cm-line": {
        padding: "0",
      },
      ".cm-placeholder": {
        color: "#7a7a7a",
      },
      ".cm-activeLine": {
        backgroundColor: "#333333",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
      },
      ".cm-gutters": {
        display: "none",
      },
      ".cm-tooltip": {
        backgroundColor: "#262626",
        color: "#8e91a4",
        border: "none",
      },
      ".cm-tooltip-autocomplete": {
        backgroundColor: "#262626",
        border: "1px solid #313233",
        borderRadius: "4px",
      },
      ".cm-completionLabel": {
        color: "white",
      },
      ".cm-completionMatchedText": {
        color: "#d35354",
        fontWeight: "bold",
      },
      ".cm-button": {
        backgroundColor: "#313233",
        color: "#8e91a4",
        border: "none",
      },
      ".cm-foldPlaceholder": {
        color: "#8A9299",
      },

      "&.cm-editor": {
        maxHeight: "200px !important",

        "&:hover": {
          outline: "1px solid var(--border-ds-neutral-300)",
          borderRadius: "4px",
        },
        "&.cm-focused": {
          borderRadius: "4px",
          outline: "1px solid var(--border-ds-primary-300)",
          height: "auto !important",
          maxHeight: "164px !important",
          minHeight: "200px !important",
          position: "absolute",
          zIndex: "10",
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        },
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
          wordBreak: "break-all !important",
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
      },
    });
  }

  public build() {
    return this.theme;
  }
}

export class UserPromptTheme {
  private theme;
  constructor() {
    this.theme = EditorView.theme({
      "&": {
        minHeight: "15px",
        backgroundColor: "transparent",
        borderRadius: "4px",
        padding: "0",
        fontSize: "14px",
        overflow: "auto",
        border: "none",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      },
      

      ".cm-editor": {
        backgroundColor: "transparent",
        borderRadius: "inherit",
        flex: "1",
        width: "100%",
        minHeight: "200px",
        maxHeight: "400px",
        height: "auto",
        overflow: "hidden",
        whiteSpace: "pre-wrap",  
        wordBreak: "break-word", 
      },

      ".cm-content": {
        whiteSpace: "pre-wrap !important",
        wordBreak: "break-all !important",
        maxHeight: "164px !important",
        width: "100% !important",
        caretColor: "white",
      },

      ".cm-line": {
        padding: "0",
      },

      ".cm-placeholder": {
        color: "#7a7a7a",
      },

      ".cm-activeLine": {
        backgroundColor: "#333333",
      },

      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
      },

      ".cm-gutters": {
        display: "none",
      },

      ".cm-tooltip": {
        backgroundColor: "#262626",
        color: "#8e91a4",
        border: "none",
      },

      ".cm-tooltip-autocomplete": {
        backgroundColor: "#262626",
        border: "1px solid #313233",
        borderRadius: "4px",
      },

      ".cm-completionLabel": {
        color: "white",
      },

      ".cm-completionMatchedText": {
        color: "#d35354",
        fontWeight: "bold",
      },

      ".cm-button": {
        backgroundColor: "#313233",
        color: "#8e91a4",
        border: "none",
      },

      ".cm-foldPlaceholder": {
        color: "#8A9299",
      },
    });
  }

  public build() {
    return this.theme;
  }
}
