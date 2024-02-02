<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { RequestDataType } from "$lib/utils/enums/request.enum";
  import { isHorizontal } from "$lib/store/request-response-section";
  import { EditorView } from "codemirror";
  // import { basicSetup, basicTheme } from "./codeMirrorTheme";
  // import {bas}
  import { EditorState, Compartment, EditorSelection } from "@codemirror/state";
  import {
    basicSetup,
    basicTheme,
  } from "$lib/components/editor/codeMirrorTheme";
  import {
    InputTheme,
    inputHighlightStyle,
    inputSetup,
    type AggregateEnvironment,
  } from "./InputEditorTheme";
  import { syntaxHighlighting } from "@codemirror/language";
  import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
  import {
    //   EditorView,
    keymap,
    ViewPlugin,
    MatchDecorator,
    Decoration,
    placeholder,
    hoverTooltip,
  } from "@codemirror/view";
  import {
    searchKeymap,
    highlightSelectionMatches,
    search,
  } from "@codemirror/search";
  import { CollectionsViewModel } from "../../../../../../pages/Collections/Collections.ViewModel";
  //   import { highlightSpecialChars } from "@codemirror/next/basic-setup";
  // import { StateField, Transaction, syntaxTree, EditorSelection, Extension } from "@codemirror/next/state";
  // import CodeMirrorViewHandler from "$lib/components/editor/CodeMirrorViewHandler";
  // import CodeMirrorViewHandler from "./CodeMirrorViewHandler";
  export let currentTabId: string;
  // export let rawTab: RequestDataType;
  export let rawValue: string;
  export let handleRawChange: () => void;
  export let handleFocusChange: () => void;
  export let handleBlurChange: () => void;
  export let handleInputChange: (data: string) => void;
  export let handleKeyUpChange: (e: EditorSelection) => void;
  export let handleKeyDownChange: (e: KeyboardEvent) => void;
  export let handleSendRequest: () => void;
  export let handleMissingEnv: (text: string) => void;
  export let codeMirrorEditorDiv: HTMLDivElement;
  export let filterData: AggregateEnvironment[];
  export let handleEnvironmentBox: (change: boolean) => void;

  const _viewModel = new CollectionsViewModel();
  const environments = _viewModel.environments;
  let env = $environments;
  // const updateENv = () => {
  //   env = $environments;
  // }

  const HOPP_ENVIRONMENT_REGEX = /({{[a-zA-Z0-9-_]+}})/g;

  const HOPP_ENV_HIGHLIGHT =
    "cursor-help transition rounded px-1 focus:outline-none mx-0.5 env-highlight";
  const HOPP_ENV_HIGHLIGHT_FOUND = "env-found";
  const HOPP_ENV_HIGHLIGHT_NOT_FOUND = "env-not-found";
  const HOVER_FOUND = "hover-found";
  const HOVER_NOT_FOUND = "hover-not-found";
  let selectedTabId = currentTabId;
  const languageConf = new Compartment();
  //   let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;
  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    handleInputChange(userInput);
    handleRawChange();
    // handleMissingEnv(
    //   codeMirrorView.state.sliceDoc(
    //     codeMirrorView.state.selection.main.from,
    //     codeMirrorView.state.selection.main.to,
    //   ),
    // );
    temp();
    // console.log(
    //   "selected2",
    //   codeMirrorView.state.sliceDoc(
    //     codeMirrorView.state.selection.main.from,
    //     codeMirrorView.state.selection.main.to,
    //   ),
    // );
  });
  const keyBinding = keymap.of([
    {
      key: "Enter",
      run: (view) => {
        handleSendRequest();
        // doStuff();
        return true;
      },
    },
  ]);

  const handleEventsRegister = EditorView.domEventHandlers({
    blur: (event, view: EditorView) => {
      // console.log("blur");
      handleBlurChange();
    },
    focus: (event, view: EditorView) => {
      // console.log("focus");
      handleFocusChange();
    },
    keyup: (event, view: EditorView) => {
      // console.log("keyup", event);
      handleKeyUpChange(codeMirrorView.state.selection);
    },

    keydown: (event, view: EditorView) => {
      // console.log("keyup");
      handleKeyDownChange(event);
    },
  });

  const temp = () => {
    const boxes = document.getElementsByClassName("env-not-found");

    for (const box of boxes) {
      // debugger;
      box.addEventListener("click", function handleClick(event) {
        console.log("box clicked", event);
        handleEnvironmentBox(true);
        // box.setAttribute("style", "background-color: yellow;");
      });
    }
  };

  const checkEnvExist = (
    env: string,
    aggregateEnvs: AggregateEnvironment[],
  ) => {
    const className = aggregateEnvs.find(
      (k: { key: string }) => k.key === env.slice(2, -2),
    )
      ? HOPP_ENV_HIGHLIGHT_FOUND
      : HOPP_ENV_HIGHLIGHT_NOT_FOUND;
    return className;
  };

  function checkEnv(env: string, aggregateEnvs: AggregateEnvironment[]) {
    const className = checkEnvExist(env, aggregateEnvs);

    return Decoration.mark({
      class: `${HOPP_ENV_HIGHLIGHT} ${className}`,
    });
  }

  const getMatchDecorator = (aggregateEnvs: AggregateEnvironment[]) =>
    new MatchDecorator({
      regexp: HOPP_ENVIRONMENT_REGEX,
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

  function checkHoverEnv(env: string, aggregateEnvs: AggregateEnvironment[]) {
    const className = aggregateEnvs.find(
      (k: { key: string }) => k.key === env.slice(2, -2),
    )
      ? HOVER_FOUND
      : HOVER_NOT_FOUND;

    return Decoration.mark({
      class: `${HOPP_ENV_HIGHLIGHT} ${className}`,
    });
  }

  const getHoverMatchDecorator = (aggregateEnvs: AggregateEnvironment[]) =>
    new MatchDecorator({
      regexp: HOPP_ENVIRONMENT_REGEX,
      decoration: (m) => checkHoverEnv(m[0], aggregateEnvs),
    });

  export const environmentHoverHighlightStyle = (
    aggregateEnvs: AggregateEnvironment[],
  ) => {
    const decorator = getHoverMatchDecorator(aggregateEnvs);

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

  const cursorTooltipField = (aggregateEnvs: AggregateEnvironment[]) =>
    hoverTooltip(
      (view, pos) => {
        const { from, to, text } = view.state.doc.lineAt(pos);
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure([
            // cursorTooltipField(filterData),
            environmentHoverHighlightStyle(filterData),
          ]),
        });

        //     new MatchDecorator({
        //   regexp: HOPP_ENVIRONMENT_REGEX,
        //   decoration: (m) => checkEnvExist(m[0], aggregateEnvs),
        // });
        // handleMissingEnv(from, to, text);
        // console.log(
        //   "selectedonhover",
        //   codeMirrorView.state.sliceDoc(
        //     codeMirrorView.state.selection.main.from,
        //     codeMirrorView.state.selection.main.to,
        //   ),
        // );
        // console.log("text", text, from, to, pos);
        // },

        // TODO: When Codemirror 6 allows this to work (not make the
        // popups appear half of the time) use this implementation
        // const wordSelection = view.state.wordAt(pos)
        // if (!wordSelection) return null
        // const word = view.state.doc.sliceString(
        //   wordSelection.from - 2,
        //   wordSelection.to + 2
        // )
        // if (!HOPP_ENVIRONMENT_REGEX.test(word)) return null

        // Tracking the start and the end of the words
        //   let start = pos;
        //   let end = pos;

        //   while (start > from && /[a-zA-Z0-9-_]+/.test(text[start - from - 1]))
        //     start--;
        //   while (end < to && /[a-zA-Z0-9-_]+/.test(text[end - from])) end++;

        //   if (
        //     (start === pos && side < 0) ||
        //     (end === pos && side > 0) ||
        //     !HOPP_ENVIRONMENT_REGEX.test(
        //       text.slice(start - from - 2, end - from + 2),
        //     )
        //   )
        //     return null;

        //   const parsedEnvKey = text.slice(start - from, end - from);

        //   const tooltipEnv = aggregateEnvs.find(
        //     (env) => env.key === parsedEnvKey,
        //   );

        //   const envName = tooltipEnv?.sourceEnv ?? "Choose an Environment";

        //   const envValue = tooltipEnv?.value ?? "Not found";

        //   // const result = parseTemplateStringE(envValue, aggregateEnvs)

        //   // const finalEnv = E.isLeft(result) ? "error" : result.right

        //   // const selectedEnvType = getSelectedEnvironmentType()

        //   const envTypeIcon = `<span class="inline-flex items-center justify-center my-1">${
        //     "TEAM_ENV" === "TEAM_ENV" ? "DO" : "NOT"
        //   }</span>`;

        //   const appendEditAction = (tooltip: HTMLElement) => {
        //     const editIcon = document.createElement("button");
        //     editIcon.className =
        //       "ml-2 cursor-pointer text-accent hover:text-accentDark";
        //     editIcon.addEventListener("click", () => {
        //       const isPersonalEnv = envName === "TEAM_ENV";
        //       const action = isPersonalEnv ? "my" : "team";
        //       // invokeAction(`modals.${action}.environment.edit`, {
        //       //   envName,
        //       //   variableName: parsedEnvKey,
        //       // })
        //     });
        //     editIcon.innerHTML = `<span class="inline-flex items-center justify-center my-1">${"Value"}</span>`;
        //     tooltip.appendChild(editIcon);
      },

      //   return {
      //     pos: start,
      //     end: to,
      //     above: true,
      //     arrow: true,
      //     create() {
      //       const dom = document.createElement("span");
      //       const tooltipContainer = document.createElement("span");
      //       const kbd = document.createElement("kbd");
      //       const icon = document.createElement("span");
      //       icon.innerHTML = envTypeIcon;
      //       icon.className = "mr-2";
      //       // kbd.textContent = finalEnv
      //       tooltipContainer.appendChild(icon);
      //       tooltipContainer.appendChild(
      //         document.createTextNode(`${envName} `),
      //       );
      //       tooltipContainer.appendChild(kbd);
      //       if (tooltipEnv) appendEditAction(tooltipContainer);
      //       tooltipContainer.className = "tippy-content";
      //       dom.className = "tippy-box";
      //       dom.dataset.theme = "tooltip";
      //       dom.appendChild(tooltipContainer);
      //       return { dom };
      //     },
      //   };
      // },
      // // HACK: This is a hack to fix hover tooltip not coming half of the time
      // // https://github.com/codemirror/tooltip/blob/765c463fc1d5afcc3ec93cee47d72606bed27e1d/src/tooltip.ts#L622
      // // Still doesn't fix the not showing up some of the time issue, but this is atleast more consistent
      // { hoverTime: 1 } as any,
    );

  function initalizeCodeMirrorEditor(value: string) {
    let state = EditorState.create({
      doc: value,
      extensions: [
        inputSetup,
        InputTheme,
        updateExtensionView,
        keyBinding,
        javascriptLanguage,
        languageConf.of(javascriptLanguage),
        handleEventsRegister,
        placeholder("Enter URL or paste text"),
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
    if (selectedTabId !== currentTabId) {
      codeMirrorView.dispatch({
        changes: {
          from: 0,
          to: codeMirrorView.state.doc.length,
          insert: rawValue,
        },
      });
      selectedTabId = currentTabId;
      handleEnvironmentBox(false);
    }
    if (rawValue.toString() !== codeMirrorView.state.doc.toString()) {
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
        // cursorTooltipField(filterData),
        environmentHighlightStyle(filterData),
      ]),
    });
    console.log("environments", env);
  });

  // let isHorizontalMode: boolean;
  // const isHorizontalUnsubscribe = isHorizontal.subscribe((value) => {
  //   isHorizontalMode = value;
  // });

  // onDestroy(() => {
  //   isHorizontalUnsubscribe();
  // });
</script>

<div id="input-request-url" bind:this={codeMirrorEditorDiv} />

<style>
  #input-request-url {
    width: 100%;
    /* height: 100%; */
    height: 34px;
    /* margin-right: 1%; */
  }
</style>
