<script lang="ts">
  import { Events } from "@sparrow/common/enums";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import {
    SendRegular,
    StopFilled,
    LockClosedRegular,
  } from "@sparrow/library/icons";
  import { Select } from "@sparrow/library/forms";
  import { Button, Tooltip } from "@sparrow/library/ui";

  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  export let placeholder = "";
  export let sendPrompt;
  export let prompt: string = "";
  export let onUpdateAiPrompt;
  export let onUpdateAiModel;
  export let isResponseGenerating;
  export let onStopGeneratingAIResponse;

  // let defaultModel = "GPT-4o";
  let defaultModel = "deepseek";

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
      // isTyping = true;
      if (event.key === "Enter" && prompt && !isResponseGenerating) {
        sendPrompt(prompt);
        onUpdateAiPrompt("");
        captureEvent("ai_chatbot_send_button_clicked", {
          component: "PromptInput",
          message_length: prompt.length,
          selected_engine: "GPT-4o",
          timestamp: new Date().toISOString(),
          response_time: null,
        });
        isTyping = false;
        isPromptBoxFocused = false;
        event.target.blur();

        // allows the DOM to update first before resetting the height.
        setTimeout(() => {
          adjustTextareaHeight();
        }, 0);
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
    <div id="ai-model-select-container">
      <Select
        id={"ai-model-selector"}
        data={[
          {
            name: "DeepSeek",
            id: "deepseek",
            disabled: false,
            hide: false,
          },
          {
            name: "GPT-4o",
            id: "GPT-4o",
            disabled: true,
            hide: true,
          },
        ]}
        titleId={defaultModel}
        onclick={(modelId) => {
          console.log("clicked", modelId);
          onUpdateAiModel(modelId);
        }}
        variant={"secondary"}
        zIndex={499}
        disabled={false}
        maxHeaderWidth={"110px"}
        minBodyWidth={"182px"}
        menuItem={"v2"}
      >
        <div
          slot="post-select"
          class="post-dropdown"
          style="justify-content: center; align-items:center;"
        >
          <div class="custom-tooltip-wrapper">
            <div class="locked-models text-ds-font-size-12" on:click={() => {}}>
              <span>GPT-4o</span>
              <Button
                type="teritiary-regular"
                startIcon={LockClosedRegular}
                size="small"
              />
            </div>
            <span class="custom-tooltip">Upgrade to use additional models.</span
            >
          </div>
          <!-- <div class="custom-tooltip-wrapper">
            <div class="locked-models text-ds-font-size-12" on:click={() => {}}>
              <span>Azure AI</span>
              <Button
                type="teritiary-regular"
                startIcon={LockClosedRegular}
                size="small"
              />
            </div>
            <span class="custom-tooltip">Upgrade to use additional models.</span
            >
          </div> -->
        </div>
      </Select>
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

  .locked-models {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-ds-neutral-100);
    background-color: var(--bg-ds-surface-600);
    cursor: pointer;
    /* min-height: 28px; */
    padding: 4px 4px 4px 8px;
    border-radius: 4px;
    opacity: 0.3;
  }

  .locked-models:hover {
    background-color: var(--bg-ds-surface-400);
  }

  .custom-tooltip-wrapper {
    position: relative;
    /* display: inline-block; */
  }

  .custom-tooltip {
    visibility: hidden;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    /* background-color: var(--bg-ds-surface-800); */
    background-color: #31353f;
    color: var(--text-ds-neutral-000);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    margin-bottom: 4px;
    z-index: 1000;
  }

  .custom-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #31353f transparent transparent transparent;
  }

  .custom-tooltip-wrapper:hover .custom-tooltip {
    visibility: visible;
  }
</style>
