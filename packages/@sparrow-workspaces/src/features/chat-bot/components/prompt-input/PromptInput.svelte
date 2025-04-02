<script lang="ts">
  import { Events } from "@sparrow/common/enums";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { GenerateIcon, SendRegular } from "@sparrow/library/icons";
  import { Select } from "@sparrow/library/forms";

  export let placeholder = "";
  export let sendPrompt;
  export let prompt: string = "";
  export let onUpdateAiPrompt;
  export let isResponseGenerating;

  let isSendButtonHovered = false;

  const handleMouseEnter = () => {
    isSendButtonHovered = true;
  };

  const handleMouseLeave = () => {
    isSendButtonHovered = false;
  };

  let isPromptBoxFocused = false;
</script>

<!-- <div class="d-flex prompt-input-container"> -->
<div
  class="prompt-input-container d-flex flex-column gap-0 {isPromptBoxFocused
    ? 'focused'
    : ''}"
>
  <!-- <input
      type=""
      bind:value={prompt}
      on:input={() => {
        onUpdateAiPrompt(prompt);
      }}
      class="w-100 pe-5 py-2 ps-2 border-radius-6 text-fs-12"
      autofocus
      style="border:1px solid grey; outline: none; background-color: var(--bg-ds-surface-400); border: 1px solid var(--border-tertiary-190); "
      {placeholder}
      on:keydown={(event) => {
        if (event.key === "Enter" && prompt && !isResponseGenerating) {
          sendPrompt(prompt);
          onUpdateAiPrompt("");
        }
      }}
    /> -->

  <textarea
    bind:value={prompt}
    on:input={() => {
      onUpdateAiPrompt(prompt);
    }}
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
      if (event.key === "Enter" && prompt && !isResponseGenerating) {
        sendPrompt(prompt);
        onUpdateAiPrompt("");
      }
    }}
    on:focus={() => {
      isPromptBoxFocused = true;
    }}
    on:blur={() => {
      isPromptBoxFocused = false;
    }}
  />

  {#if !isResponseGenerating}
    <div
      class="actions-container d-flex justify-content-between align-items-center"
    >
      <div id="ai-model-select-container">
        <Select
          id={"ai-model-selector"}
          data={[
            {
              name: "Azure AI",
              id: "none1",
              type: null,
              hide: false,
            },
            {
              name: "Open AI 4.0",
              id: "none2",
              display: "none",
              type: null,
            },
            {
              name: "DeepSeek R1",
              id: "none3",
              display: "none",
              type: null,
            },
          ]}
          titleId={"none1"}
          onclick={() => {
            console.log("AI Model Selected!!");
          }}
          maxHeaderWidth={"88px"}
          headerTheme={"violet2"}
          minBodyWidth={"182px"}
          bodyTheme={"surface"}
          bodyDirection={"up"}
          iconRequired={false}
          borderType={"none"}
          borderActiveType={"none"}
          headerHighlight={"hover-active"}
          menuItem={"v2"}
          headerFontSize={"12px"}
          zIndex={200}
          borderRounded={"2px"}
          position={"absolute"}
          headerHeight={"28px"}
        />
      </div>

      <div
        class="actionBtn-outline"
        style="cursor:pointer;"
        on:click={() => {
          if (prompt) {
            sendPrompt(prompt);
            onUpdateAiPrompt("");
            MixpanelEvent(Events.AI_Initiate_Response);
          }
        }}
        on:mouseenter={handleMouseEnter}
        on:mouseleave={handleMouseLeave}
      >
        <SendRegular
          size={"14px"}
          color={prompt.trim()
            ? "var( --bg-ds-neutral-50)"
            : isSendButtonHovered
              ? "var(--icon-secondary-100)"
              : "var(--border-ds-neutral-400)"}
        />
      </div>
    </div>
  {:else}
    <!--Disabling it for now, will take stop generation when data streaming will be enabled.-->
    <!-- <div
        style="position:absolute; right:12px ; top: 50%; 
    transform : translateY(-60%);
  "
        on:click={() => {}}
      >
        <GenerateIcon
          height={"20px"}
          width={"20px"}
          color={"var(--icon-secondary-100)"}
        />
      </div> -->
  {/if}
</div>

<!-- </div> -->

<style>
  /* input::placeholder {
    color: var(--text-ds-neutral-400);
  }
  input {
    border: 1px solid transparent;
  }
  input:focus {
    outline: none;
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  input:hover {
    border: 1px solid var(--border-ds-primary-300) !important;
  } */

  .prompt-input-container {
    background-color: #222630 !important;
    border-radius: 4px;
    padding: 8px;
    /* transition: outline 0.3s ease-in-out; */
  }

  .prompt-input-container:hover {
    outline: 1px solid #9b9da1;
  }

  .prompt-input-container.focused {
    outline: 2px solid #6894f9;
  }

  .prompt-text-field-area {
    width: 100%;
    height: 40px;
    font-family: "inter", sans-serif;
    font-size: 12px;
    font-weight: 400;
    border: none !important;
    outline: none;
    caret-color: #6894f9;
  }

  .actionBtn-outline {
    border-radius: 4px;
    border: 2px solid #414858;
    padding: 4px;
  }
</style>
