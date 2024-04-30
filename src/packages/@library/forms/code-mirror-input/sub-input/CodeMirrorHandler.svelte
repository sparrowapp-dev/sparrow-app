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
    hoverTooltip,
    type Tooltip,
  } from "@codemirror/view";
  import {
    environmentHoverHighlightStyle,
    type AggregateEnvironment,
  } from "./CodeMirrorHandler";
  import { editLink } from "$lib/store/api-request";
  // export let currentTabId: string;
  export let rawValue: string;
  export let handleRawChange: () => void;
  export let handleFocusChange: () => void;
  export let handleBlurChange: () => void;
  export let handleInputChange: (data: string) => void;
  export let handleKeyUpChange: (e: EditorSelection) => void;
  export let handleKeyDownChange: (e: KeyboardEvent) => void;
  export let codeMirrorEditorDiv: HTMLDivElement;
  export let filterData: AggregateEnvironment[];
  export let handleEnvironmentBox: (change: boolean, envKey: string) => void;
  export let placeholder;
  export let theme;
  export let disabled;
  let localEnvKey = "";

  const ENVIRONMENT_REGEX = /({{[a-zA-Z0-9-_\s]+}})/g;

  const ENV_HIGHLIGHT = "env-highlight";
  const ENV_HIGHLIGHT_FOUND = "env-found";
  const ENV_HIGHLIGHT_NOT_FOUND = "env-not-found";
  const HOVER_TIME = 3000;
  // let selectedTabId = currentTabId;
  const languageConf = new Compartment();
  let codeMirrorView: EditorView;
  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    handleInputChange(userInput);
    if (rawValue?.length > 0) {
      handleRawChange();
    }
    handleHighlightClass();
  });
  const keyBinding = keymap.of([
    {
      key: "Enter",
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

  editLink.subscribe((value) => {
    codeMirrorView?.focus();
  });

  const handleHighlightClass = () => {
    const boxes = document.getElementsByClassName("env-not-found");
    if (boxes.length > 0) {
      for (const box of boxes) {
        box.addEventListener("click", function handleClick(event) {
          const envExist = filterData.find(
            (k: { key: string }) => k.key === localEnvKey,
          );
          if (!envExist) {
            handleEnvironmentBox(true, localEnvKey);
          } else handleEnvironmentBox(false, localEnvKey);
        });
      }
    } else handleEnvironmentBox(false, localEnvKey);
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

  const cursorTooltipField = (aggregateEnvs: AggregateEnvironment[]) => {
    return hoverTooltip(
      (view, pos) => {
        const { from, to, text } = view.state.doc.lineAt(pos);
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure([
            environmentHoverHighlightStyle(filterData),
          ]),
        });
        setTimeout(() => {
          codeMirrorView.dispatch({
            effects: languageConf.reconfigure([
              environmentHighlightStyle(filterData),
            ]),
          });
        }, HOVER_TIME);
        let start = 0,
          end = 0;
        for (let index = pos; index > from; index--) {
          if (text[index] === "{" && text[index - 1] === "{") {
            start = index + 1;
            break;
          }
        }
        for (let index = pos; index < to; index++) {
          if (text[index] === "}" && text[index + 1] === "}") {
            end = index;
            break;
          }
        }
        localEnvKey = text.substring(start, end);
      },
      {
        hideOnChange: true,
      },
    );
  };

  const wordHover = hoverTooltip((view, pos, side) => {
    let { from, to, text } = view.state.doc.lineAt(pos);
    let start = pos,
      end = pos;
    while (start > from && /\w/.test(text[start - from - 1])) start--;
    while (end < to && /\w/.test(text[end - from])) end++;
    if ((start == pos && side < 0) || (end == pos && side > 0)) return null;
    const envKey = text.slice(start - from, end - from);
    let envExist = false;
    let envValue = "";
    filterData.find((k: { key: string; value: string }) => {
      if (k.key === envKey) {
        envExist = true;
        envValue = k.value;
      }
    });
    if (!envExist) {
      return null;
    }
    return {
      pos: start,
      end,
      above: true,
      create(view) {
        let dom = document.createElement("div");
        dom.textContent = `${envKey} = ${envValue}`;
        return { dom };
      },
    };
  });

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
        cursorTooltipField(filterData),
        wordHover,
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
    // if (selectedTabId !== currentTabId) {
    //   codeMirrorView.dispatch({
    //     changes: {
    //       from: 0,
    //       to: codeMirrorView.state.doc.length,
    //       insert: rawValue,
    //     },
    //   });
    //   selectedTabId = currentTabId;
    //   handleEnvironmentBox(false, localEnvKey);
    // }
    handleEnvironmentBox(false, localEnvKey);
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

<div id="input-request-url" bind:this={codeMirrorEditorDiv} />

<style>
  #input-request-url {
    width: 100%;
    max-width: calc(100vw - 50px);
    min-width: 50%;
  }
</style>
