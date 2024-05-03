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
  export let placeholder: string;
  export let theme: object;
  export let disabled: boolean = false;
  export let environmentAxisY;
  export let environmentAxisX;
  export let id;

  let inputWrapper: HTMLElement;
  let localEnvKey = "";

  const ENVIRONMENT_REGEX = /({{[a-zA-Z0-9-_\s]+}})/g;

  const ENV_HIGHLIGHT = "env-highlight";
  const ENV_HIGHLIGHT_FOUND = "env-found" + id + " env-found";
  const ENV_HIGHLIGHT_NOT_FOUND = "env-not-found" + id + " env-not-found";
  const HOVER_TIME = 3000;
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
      if (
        text[start - from - 1] === "{" &&
        text[start - from - 2] === "{" &&
        text[end - from + 0] === "}" &&
        text[end - from + 1] === "}"
      ) {
        /**
         * environment doesn't exist
         */
        return;
        return {
          pos: start,
          end,
          top: 20,
          above: true,
          create(view) {
            let dom = document.createElement("div");
            const screen1 = `<div id="screen1">
                <p>This variable is missing in your workspace. Try adding it as a global variable or under the active environment.</p>
                <button id="add-variable">Add Variable</button>
                </div>`;
            const screen2 = `<div id="screen2">
                <input type="text"/ disabled value="${envKey}">
                <input type="text" placeholder = "Enter Value"/>

                <button id="add-apply">Add & Apply</button>
                </div>`;
            dom.innerHTML = `<div>${screen1} ${screen2}</div>`;
            dom.style.height = "200px";
            dom.style.width = "400px";
            dom.style.backgroundColor = "red";
            // dom.textContent = `asifbhai`;

            let addButton = dom.querySelector("button#add-variable");
            let applyButton = dom.querySelector("button#add-apply");
            dom.querySelector("#screen2").style.display = "none";

            // Add event listener to the button
            addButton.addEventListener("click", function () {
              // Perform your action here, for example:
              // alert("Button clicked!");
              dom.querySelector("#screen1").style.display = "none";
              dom.querySelector("#screen2").style.display = "block";

              // You can replace the above line with any action you want to perform.
            });
            applyButton.addEventListener("click", function () {
              // Perform your action here, for example:
              // alert("Button clicked!");
              alert("applied  ");

              // You can replace the above line with any action you want to perform.
            });
            return { dom };
          },
        };
      } else {
        return;
      }
    }
    /**
     * environment exist
     */
    return;
    return {
      pos: start,
      end,
      above: true,
      create(view) {
        let dom = document.createElement("div");
        dom.style.height = "200px";
        dom.style.width = "400px";
        dom.style.backgroundColor = "green";
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

<style>
  .basic-code-mirror-input {
    width: 100%;
    max-width: calc(100vw - 50px);
    min-width: 50%;
  }
</style>
