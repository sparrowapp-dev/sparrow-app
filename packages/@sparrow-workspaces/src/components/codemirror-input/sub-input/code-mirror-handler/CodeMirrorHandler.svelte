<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { EditorView } from "codemirror";
  import {
    EditorState,
    Compartment,
    EditorSelection,
    type TransactionSpec,
    RangeSetBuilder,
  } from "@codemirror/state";
  import { javascriptLanguage } from "@codemirror/lang-javascript";
  import {
    keymap,
    ViewPlugin,
    MatchDecorator,
    Decoration,
    placeholder as CreatePlaceHolder,
    WidgetType,
    type DecorationSet,
    ViewUpdate,
  } from "@codemirror/view";
  import { undo, redo } from "@codemirror/commands";
  import { history, historyKeymap } from "@codemirror/commands";
  /**
   * input value
   */
  export let rawValue: string;
  /**
   * on focus event
   */
  export let handleFocusChange: () => void;
  /**
   * in blur event
   */
  export let handleBlurChange: () => void;
  /**
   * on change event
   */
  export let handleInputChange: (data: string) => void;
  /**
   * key press event
   */
  export let handleKeyUpChange: (e: EditorSelection) => void;
  export let handleKeyDownChange: (e: KeyboardEvent) => void;
  /**
   * Filtered environment data
   */
  export let filterData: AggregateEnvironment[];
  /**
   * handles environment dialog box
   */
  export let handleEnvironmentBox: (change: string, envKey: string) => void;
  /**
   * input states
   */
  export let placeholder: string;
  export let theme: object;
  export let disabled: boolean = false;
  /**
   * environment dialog box positions
   */
  export let environmentAxisY;
  export let environmentAxisX;
  export let enableEnvironmentHighlighting = true;
  /**
   * environment dialog box unique id
   */
  export let id;
  export let componentClass;
  export let isFocusedOnMount = false;
  export let handleOpenDE;

  let inputWrapper: HTMLElement;
  let localEnvKey = "";
  let codeMirrorEditorDiv: HTMLDivElement;

  const ENVIRONMENT_REGEX =
    /({{[a-zA-Z0-9-_!@#$%^&*()+=\[\]|\\;:'",.<>?/`\s]+}})/g;

  type AggregateEnvironment = {
    key: string;
    value: string;
    type: string;
    environment: string;
  };
  const ENV_HIGHLIGHT = "env-highlight";
  const ENV_HIGHLIGHT_FOUND = "env-found" + id + " env-found";
  const ENV_HIGHLIGHT_NOT_FOUND = "env-not-found" + id + " env-not-found";
  const languageConf = new Compartment();
  let codeMirrorView: EditorView;
  let prevValue = "";

  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    if (update.docChanged) {
      const isAutoChange = update?.transactions?.some((transaction) =>
        transaction?.annotations?.some((annotation) => annotation?.autoChange),
      );
      if (!isAutoChange) {
        // only hits for input, blur etc type of events
        handleInputChange(userInput);
        if (prevValue !== userInput) {
          handleEnvironmentBox("", "");
        }
        prevValue = userInput;
      }
    }
    handleHighlightClass();
    if (inputWrapper) {
      const dialogboxWidth = 400;
      const dialogboxHeight = 170;
      const rightDistance = inputWrapper.getBoundingClientRect().right;
      const leftDistance = inputWrapper.getBoundingClientRect().left;
      const bottomDistance = inputWrapper.getBoundingClientRect().bottom;
      const topDistance = inputWrapper.getBoundingClientRect().top;
      environmentAxisY = bottomDistance + 8;
      environmentAxisX =
        leftDistance + codeMirrorView.state.selection.ranges[0].from * 2;
      if (environmentAxisX + dialogboxWidth > rightDistance) {
        /**
         * Handle dialog overflow in x direction
         */
        environmentAxisX =
          leftDistance + (rightDistance - leftDistance - dialogboxWidth);
      }
      if (environmentAxisY + dialogboxHeight > window.innerHeight) {
        /**
         * Handle dialog overflow in y direction
         */
        environmentAxisY = topDistance - dialogboxHeight - 8;
      }
    }
  });

  /**
   * Widget to render the dynamic expression.
   */
  class ExpressionWidget extends WidgetType {
    constructor(
      readonly name: string,
      readonly from: number,
      readonly to: number,
      // readonly id: string,
    ) {
      super();
    }

    toDOM(view: EditorView) {
      const container = document.createElement("span");
      container.className = "cm-expression-block";

      const text = document.createElement("span");
      text.textContent = this.name;

      const close = document.createElement("span");
      close.textContent = "❌";
      close.className = "cm-expression-block-close";

      close.onclick = (e) => {
        e.stopPropagation();
        view.dispatch({ changes: { from: this.from, to: this.to } });

        // removeDynamicExpression(this.id);
      };

      container.appendChild(text);
      container.appendChild(close);

      container.onclick = (e) => {
        e.stopPropagation();
        const content = view.state.doc.sliceString(this.from, this.to);
        handleOpenDE({
          source: { from: this.from, to: this.to, content },
        });
      };

      return container;
    }

    ignoreEvent() {
      return true;
    }
  }
  let currentIndex = 0;

  /**
   * Create regex matching pattern for the expression.
   * @example [[expression]]
   */

  //  regexp: /\[\*\$\[(.*?)\]\$\*\]/g,
  //   decoration: (match) =>
  //     Decoration.replace({
  const expressionMatcher = new MatchDecorator({
    regexp: /\[\*\$\[(.*?)\]\$\*\]/g,
    decoration: (match) => {
      return Decoration.replace({
        widget: new ExpressionWidget(
          match[1],
          match.index,
          match.index + match[0].length,
        ),
        inclusive: false,
      });
    },
  });
  /**
   * Create a decoration set for the expression matcher.
   * @param view - The editor view instance.
   */
  const expressionPlugin = ViewPlugin.fromClass(
    class {
      placeholders: DecorationSet;
      constructor(view: EditorView) {
        currentIndex = 0;
        this.placeholders = expressionMatcher.createDeco(view);
      }
      update(update: ViewUpdate) {
        currentIndex = 0;
        this.placeholders = expressionMatcher.updateDeco(
          update,
          this.placeholders,
        );
      }
    },
    {
      decorations: (instance) => instance.placeholders,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.placeholders || Decoration.none;
        }),
    },
  );

  /**
   * handle keyboard events in codemirror
   */
  const keyBinding = keymap.of([
    {
      key: "Ctrl-z",
      run: undo,
    },
    {
      key: "Ctrl-y",
      run: redo,
    },
    {
      key: "Cmd-z",
      run: undo,
    },
    {
      key: "Cmd-Shift-z",
      run: redo,
    },
    {
      key: "Cmd-y",
      run: redo,
    },
    {
      key: "Enter",
      run: (view) => {
        return true;
      },
    },
    {
      key: "Shift-Enter",
      run: (view) => {
        return true;
      },
    },
    {
      key: "Cmd-Enter",
      run: (view) => {
        return true;
      },
    },

    {
      key: "Ctrl-Enter",
      run: (view) => {
        return true;
      },
    },
    {
      key: "Alt-Enter",
      run: (view) => {
        return true;
      },
    },

    {
      key: "Alt-l",
      run: (view) => {
        return true;
      },
    },
    {
      key: "Alt-p",
      run: (view) => {
        return true;
      },
    },
    {
      key: "Alt-h",
      run: (view) => {
        return true;
      },
    },
    {
      key: "Alt-b",
      run: (view) => {
        return true;
      },
    },
  ]);

  /**
   * Handles the paste event in the CodeMirror editor.
   *
   * This function retrieves text data from the clipboard, sanitizes it
   * by removing newline characters, and inserts it at the current cursor
   * position in the CodeMirror editor.
   *
   * @param  event - The paste event containing the clipboard data.
   */
  const handlePaste = (event: ClipboardEvent): void => {
    event.preventDefault(); // Prevent the default paste behavior
    // Access the clipboard data directly
    navigator.clipboard
      .readText()
      .then((text) => {
        // Remove newline characters from the pasted text
        const sanitizedData = text.replace(/\r?\n/g, " ");
        codeMirrorView?.dispatch({
          changes: {
            from: codeMirrorView.state.selection.main.from,
            to: codeMirrorView.state.selection.main.to,
            insert: sanitizedData,
          },
          selection: {
            anchor:
              codeMirrorView.state.selection.main.from + sanitizedData.length,
          },
        });
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  };

  /**
   * @description - handles event listeners
   */
  const handleEventsRegister = EditorView.domEventHandlers({
    blur: (event, view: EditorView) => {
      handleBlurChange();
    },
    focus: (event, view: EditorView) => {
      handleFocusChange();
    },
    keyup: (event, view: EditorView) => {
      handleKeyUpChange(codeMirrorView.state.selection);
    },

    keydown: (event, view: EditorView) => {
      handleKeyDownChange(event);
    },

    paste: handlePaste, // triggers paste event
  });

  /**
   * @description - handles keyboard events
   * @param event
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    } else if (event.altKey && event.code === "KeyL" && id.includes("url")) {
      event.preventDefault();
      codeMirrorView?.focus();
    }
  };

  /**
   * @description - triggers environemnt click on codemirror
   */
  const handleHighlightClass = () => {
    const boxes = document.querySelectorAll(
      `.${ENV_HIGHLIGHT_NOT_FOUND.split(" ")[0]}`,
    );
    if (boxes.length > 0) {
      for (const box of boxes) {
        box.addEventListener("click", function handleClick(event) {
          handleEnvironmentBox(
            "env-not-found",
            event.target.innerText.replace(/[{}]/g, ""),
          );
        });
      }
    }

    const es = document.querySelectorAll(
      `.${ENV_HIGHLIGHT_FOUND.split(" ")[0]}`,
    );
    if (es.length > 0) {
      for (const box of es) {
        box.addEventListener("click", function handleClick(event) {
          handleEnvironmentBox(
            "env-found",
            event.target.innerText.replace(/[{}]/g, ""),
          );
        });
      }
    }
  };

  /**
   * @description - marks if the environment exist or not
   * @param env - input environment
   * @param aggregateEnvs - environment list
   */
  const checkEnvExist = (
    env: string,
    aggregateEnvs: AggregateEnvironment[],
  ) => {
    const className = aggregateEnvs.find(
      (k: { key: string }) => k.key === env.slice(2, -2),
    )
      ? ENV_HIGHLIGHT_FOUND
      : ENV_HIGHLIGHT_NOT_FOUND;
    return className;
  };

  function checkEnv(env: string, aggregateEnvs: AggregateEnvironment[]) {
    const className = checkEnvExist(env, aggregateEnvs);
    localEnvKey = env.slice(2, -2);

    return Decoration.mark({
      class: `${ENV_HIGHLIGHT} ${className}`,
    });
  }

  /**
   * @description - Highlights codemirror data
   * @param aggregateEnvs - environments
   */
  const getMatchDecorator = (aggregateEnvs: AggregateEnvironment[]) =>
    new MatchDecorator({
      regexp: ENVIRONMENT_REGEX,
      decoration: (m) => checkEnv(m[0], aggregateEnvs),
    });

  export const environmentHighlightStyle = (
    aggregateEnvs: AggregateEnvironment[],
    enableHighlighting: boolean,
  ) => {
    if (!enableHighlighting) {
      return ViewPlugin.define(
        () => ({
          decorations: Decoration.none,
          update() {},
        }),
        {
          decorations: (v) => v.decorations,
        },
      );
    }

    const decorator = getMatchDecorator(aggregateEnvs);

    return ViewPlugin.define(
      (view) => ({
        decorations: decorator.createDeco(view),
        update(u) {
          this.decorations = decorator.updateDeco(u, this.decorations);
        },
      }),
      {
        decorations: (v) => v.decorations,
      },
    );
  };

  /**
   * Initialize code mirror editor
   * @param value - data that needs to be rendered on code mirror
   */
  function initalizeCodeMirrorEditor(value: string) {
    let state = EditorState.create({
      doc: value,
      extensions: [
        theme,
        expressionPlugin,
        updateExtensionView,
        keyBinding,
        history(), // Add history extension
        keymap.of(historyKeymap),
        languageConf.of(javascriptLanguage),
        EditorState.readOnly.of(disabled ? true : false),
        handleEventsRegister,
        CreatePlaceHolder(placeholder),
      ],
    });
    codeMirrorView = new EditorView({
      parent: codeMirrorEditorDiv,
      state: state,
    });
  }
  onMount(() => {
    const initializeAsync = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => {
          initalizeCodeMirrorEditor(rawValue);
          if (isFocusedOnMount) codeMirrorView.focus();
        });
      } else {
        // Fallback to setTimeout for environments where requestIdleCallback is not available
        setTimeout(() => {
          initalizeCodeMirrorEditor(rawValue);
          if (isFocusedOnMount) codeMirrorView.focus();
        }, 0);
      }
    };

    initializeAsync();
  });

  afterUpdate(() => {
    if (codeMirrorView) {
      if (rawValue?.toString() !== codeMirrorView.state.doc?.toString()) {
        codeMirrorView.dispatch({
          changes: {
            from: 0,
            to: codeMirrorView.state.doc.length,
            insert: rawValue,
          },
          annotations: [{ autoChange: true }],
        });
      }
      codeMirrorView.dispatch({
        effects: languageConf.reconfigure([
          environmentHighlightStyle(filterData, enableEnvironmentHighlighting),
        ]),
      });
    }
  });

  const destroyCodeMirrorEditor = () => {
    if (codeMirrorView) {
      codeMirrorView.destroy(); // Destroy the editor view
    }
  };
  onDestroy(() => {
    destroyCodeMirrorEditor();
  });
</script>

<div class="w-100 basic-code-mirror-input" bind:this={inputWrapper}>
  <div class={componentClass} bind:this={codeMirrorEditorDiv} />
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .basic-code-mirror-input {
    width: 100%;
    max-width: calc(100vw - 50px);
    min-width: 50%;
  }

  :global(.cm-expression-block) {
    display: inline-block;
    background-color: var(--bg-ds-neutral-50);
    border-radius: 4px;
    padding: 0px 6px;
    cursor: pointer;
  }

  :global(.cm-expression-block span) {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
    color: var(--text-ds-neutral-800);
  }

  :global(.cm-expression-block-close) {
    cursor: pointer;
    font-size: 0.8em;
    margin-left: 4px;
    color: var(--text-ds-danger-300);
  }
</style>
