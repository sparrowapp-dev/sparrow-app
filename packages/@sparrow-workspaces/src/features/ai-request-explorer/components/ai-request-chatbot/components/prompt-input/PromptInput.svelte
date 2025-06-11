<script lang="ts">
  import { Events } from "@sparrow/common/enums";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import {
    BotSparkleFilled,
    SendRegular,
    StopFilled,
  } from "@sparrow/library/icons";
  import { Select } from "@sparrow/library/forms";
  import { Button, Tooltip } from "@sparrow/library/ui";

  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  export let placeholder = "";
  export let sendPrompt;
  export let prompt: string = "";
  export let onUpdateAiPrompt;
  export let isResponseGenerating;
  export let onStopGeneratingAIResponse;

  function adjustTextareaHeight() {
    const textAreaInput = document.getElementById("input-prompt-text");
    if (!textAreaInput) return;
    textAreaInput.style.height = "20px"; // Reset to initial height
    textAreaInput.style.height = textAreaInput.scrollHeight + "px"; // Expand based on content
  }

  let isPromptBoxFocused = false;
  let isTyping = false;

  const hanldeStartGenerating = async () => {
    // allows the DOM to update first before resetting the height.
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);

    if (prompt) {
      sendPrompt(prompt);
      onUpdateAiPrompt("");
      MixpanelEvent(Events.AI_Initiate_Response);
    }
  };
</script>

<div
  class="prompt-input-container d-flex flex-column gap-3 {isPromptBoxFocused
    ? 'focused'
    : ''} {isTyping ? 'typing' : ''}"
>
  <textarea
    bind:value={prompt}
    on:input={() => {
      isTyping = true;
      onUpdateAiPrompt(prompt);
      adjustTextareaHeight(event.target);
    }}
    disabled={isResponseGenerating ? true : false}
    required
    id={"input-prompt-text"}
    {placeholder}
    class="w-100 prompt-text-field-area"
    style="border:1px solid grey; outline: none; background-color: var(--bg-ds-surface-400); border: 1px solid var(--border-tertiary-190); "
    autocomplete="off"
    spellcheck="false"
    autocorrect="off"
    autocapitalize="off"
    maxlength={10000}
    on:keydown={(event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!isResponseGenerating && prompt.trim()) {
          sendPrompt(prompt);
          onUpdateAiPrompt("");
          isTyping = false;
          isPromptBoxFocused = false;
          event.target.blur();

          // allows the DOM to update first before resetting the height.
          setTimeout(() => {
            adjustTextareaHeight();
          }, 0);
        }
      }
    }}
    on:focus={() => {
      isPromptBoxFocused = true;
      isTyping = false;
    }}
    on:blur={() => {
      isPromptBoxFocused = false;
      isTyping = false;
    }}
  />

  <div
    class="actions-container d-flex justify-content-between align-items-center"
  >
    <div id="generate-prompt-chip">
      <Tooltip title={"Coming Soon"} placement={"top-center"}>
        <button
          class="generate-prompt-btn d-flex align-items-center gap-1 px-2 py-1 rounded-1 opacity-50"
        >
          <BotSparkleFilled size={"15px"} color="#4387f4" />
          <span class="text-ds-font-size-12 fw-medium">Generate Prompt</span>
        </button>
      </Tooltip>
    </div>

    <Tooltip
      title={isResponseGenerating ? "Stop" : "Send"}
      placement={"top-center"}
      size={"small"}
    >
      <Button
        textStyleProp={"font-size: var(--base-text)"}
        type={"outline-primary"}
        size={"small"}
        startIcon={isResponseGenerating ? StopFilled : SendRegular}
        onClick={() => {
          if (isResponseGenerating) {
            onStopGeneratingAIResponse();
            return;
          }
          if (!isResponseGenerating && prompt.trim()) {
            hanldeStartGenerating();
            return;
          }
        }}
      ></Button>
    </Tooltip>
  </div>
</div>

<style>
  .prompt-input-container {
    background-color: var(--bg-ds-surface-400) !important;
    border-radius: 4px;
    padding: 8px;
  }

  .prompt-input-container:hover {
    outline: 1px solid var(--border-ds-neutral-300);
  }

  .prompt-input-container.focused {
    outline: 2px solid var(--border-ds-primary-300);
  }

  .prompt-input-container.typing {
    outline: 1px solid var(--border-ds-primary-300);
  }

  .prompt-text-field-area {
    width: 100%;
    height: 20px;
    max-height: 160px !important;
    font-family: "inter", sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.45; /* 145% */
    letter-spacing: 0;
    border: none !important;
    outline: none;
    caret-color: var(--border-ds-primary-300);
  }

  textarea::-webkit-scrollbar-thumb {
    background-color: var(--bg-ds-surface-100);
    border-radius: 8px;
  }

  /* pointer to default when hovering scrollbar */
  textarea::-webkit-scrollbar,
  textarea::-webkit-scrollbar-thumb,
  textarea::-webkit-scrollbar-button {
    cursor: default;
  }

  .actionBtn-outline {
    border-radius: 4px;
    border: 2px solid var(--border-ds-surface-50);
    padding: 4px;
  }

  .generate-prompt-btn {
    background-color: var(--bg-ds-surface-700);
    color: var(--sparrow-white);
    border: 1px solid var(--bg-ds-surface-100);
    font-size: 12px;
    font-weight: 500;
  }

  /* .generate-prompt-btn:hover {
    background-color: rgba(30, 30, 35, 0.95);
  } */
</style>
