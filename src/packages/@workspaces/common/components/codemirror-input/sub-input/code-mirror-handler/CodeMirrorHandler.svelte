<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import { EditorView } from "codemirror";
  import { EditorState, Compartment, EditorSelection } from "@codemirror/state";
  import { javascriptLanguage } from "@codemirror/lang-javascript";
  import {
    keymap,
    ViewPlugin,
    MatchDecorator,
    Decoration,
    placeholder as CreatePlaceHolder,
  } from "@codemirror/view";
  import { editLink } from "$lib/store/api-request";
  export let rawValue: string;
  export let handleRawChange: () => void;
  export let handleFocusChange: () => void;
  export let handleBlurChange: () => void;
  export let handleInputChange: (data: string) => void;
  export let handleKeyUpChange: (e: EditorSelection) => void;
  export let handleKeyDownChange: (e: KeyboardEvent) => void;
  export let codeMirrorEditorDiv: HTMLDivElement;
  export let filterData: AggregateEnvironment[];
  export let handleEnvironmentBox: (change: string, envKey: string) => void;
  export let placeholder: string;
  export let theme: object;
  export let disabled: boolean = false;
  export let environmentAxisY;
  export let environmentAxisX;
  export let id;

  let inputWrapper: HTMLElement;
  let localEnvKey = "";

  const ENVIRONMENT_REGEX = /({{[a-zA-Z0-9-_\s]+}})/g;

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
  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    handleInputChange(userInput);
    if (rawValue?.length > 0) {
      handleRawChange();
    }
    handleHighlightClass();

    if (inputWrapper) {
      const dialogboxWidth = 400;
      const rightDistance = inputWrapper.getBoundingClientRect().right;
      const leftDistance = inputWrapper.getBoundingClientRect().left;
      const bottomDistance = inputWrapper.getBoundingClientRect().bottom;
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
    }
  });
  const keyBinding = keymap.of([
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
  ]);

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
  });

  editLink.subscribe((value) => {});
  const handleKeyPress = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    } else if (event.altKey && event.code === "KeyL" && id.includes("url")) {
      codeMirrorView?.focus();
    }
  };

  const handleHighlightClass = () => {
    const boxes = document.querySelectorAll(
      `.${ENV_HIGHLIGHT_NOT_FOUND.split(" ")[0]}`,
    );
    if (boxes.length > 0) {
      for (const box of boxes) {
        box.addEventListener("click", function handleClick(event) {
          // setTimeout(() => {
          handleEnvironmentBox(
            "env-not-found",
            event.target.innerText.replace(/[{}]/g, ""),
          );
          // }, 100);
        });
      }
    }

    const es = document.querySelectorAll(
      `.${ENV_HIGHLIGHT_FOUND.split(" ")[0]}`,
    );
    if (es.length > 0) {
      for (const box of es) {
        box.addEventListener("click", function handleClick(event) {
          // setTimeout(() => {
          handleEnvironmentBox(
            "env-found",
            event.target.innerText.replace(/[{}]/g, ""),
          );
          // }, 100);
        });
      }
    }
  };

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

  const getMatchDecorator = (aggregateEnvs: AggregateEnvironment[]) =>
    new MatchDecorator({
      regexp: ENVIRONMENT_REGEX,
      decoration: (m) => checkEnv(m[0], aggregateEnvs),
    });

  export const environmentHighlightStyle = (
    aggregateEnvs: AggregateEnvironment[],
  ) => {
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

  function initalizeCodeMirrorEditor(value: string) {
    let state = EditorState.create({
      doc: value,
      extensions: [
        theme,
        updateExtensionView,
        keyBinding,
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
    initalizeCodeMirrorEditor(rawValue);
  });

  afterUpdate(() => {
    if (rawValue?.toString() !== codeMirrorView.state.doc?.toString()) {
      codeMirrorView.dispatch({
        changes: {
          from: 0,
          to: codeMirrorView.state.doc.length,
          insert: rawValue,
        },
      });
    }
    codeMirrorView.dispatch({
      effects: languageConf.reconfigure([
        environmentHighlightStyle(filterData),
      ]),
    });
  });
</script>

<div class="w-100 basic-code-mirror-input" bind:this={inputWrapper}>
  <div class="" bind:this={codeMirrorEditorDiv} />
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .basic-code-mirror-input {
    width: 100%;
    max-width: calc(100vw - 50px);
    min-width: 50%;
  }
</style>
