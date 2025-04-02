<script lang="ts">
  import { Events } from "@sparrow/common/enums";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { GenerateIcon, SendRegular } from "@sparrow/library/icons";
  import { Editor, Select } from "@sparrow/library/forms";
  import { Modal } from "@sparrow/library/ui";
  import { bool } from "yup";

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

  ///////
  let isCodeBlockOpen = true;

  let codeSample = `function greet(name) {return "Hello, " + name + "!";}

  /**
   * Sends a prompt message to the AI Assistant server via WebSocket.
   *
   * @param prompt - The prompt data to send.
   */
  public sendPromptMessage = async (prompt: StreamPromptDto) => {
    console.log("Inside sendPromptMessage() :>>");
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify({ event: "sendPrompt", data: prompt }));
      console.log("Prompt message sent");
    } else {
      console.error("WebSocket not connected, cannot send prompt message");
    }
  };
  
  `;

  function openCodeBlock() {
    isCodeBlockOpen = true;
  }

  function closeCodeBlock() {
    isCodeBlockOpen = false;
  }
</script>

<Modal
  title={"Code Block Preview"}
  type={"dark"}
  isOpen={isCodeBlockOpen}
  width={"40%"}
  handleModalState={closeCodeBlock}
>
  <div class="code-block-container">
    <!-- ✅ Icons for Copy & Preview -->
    <div class="code-block-icons">
      <SendRegular size={"14px"} />
      <SendRegular size={"14px"} />
    </div>

    <!-- ✅ Code Editor -->
    <Editor
      lang={"JSON"}
      value={codeSample}
      isEditable={false}
      class="m-0"
      isBodyBeautified={true}
    />
  </div>
</Modal>

<div class="d-flex prompt-input-container p-3">
  <div class="prompt-text-block w-100">
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
      class="w-100 prompt-text-field-area fs-12 p-2"
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
    />

    {#if !isResponseGenerating}
      <div
        class="actions-container d-flex justify-content-between align-items-center"
        style="width: 95%; margin: auto; "
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
</div>

<style>
  .code-block-container {
    background-color: #101318;
    padding: 10px;
    border-radius: 5px;
    max-height: 400px;
    overflow-y: auto;
    position: relative; /* Needed for icon positioning */
  }

  /* ✅ Slim, modern scrollbar */
  .code-block-container::-webkit-scrollbar {
    width: 6px;
  }

  .code-block-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px; /* Rounded edges */
  }

  .code-block-container::-webkit-scrollbar-track {
    background: transparent; /* No track background */
  }

  /* ✅ Icon container (top-right but slightly left aligned) */
  .code-block-icons {
    position: absolute;
    top: 8px;
    right: 12px;
    display: flex;
    gap: 8px; /* Space between icons */
  }

  /* ✅ Individual icons */
  .code-block-icons .icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .code-block-icons .icon:hover {
    opacity: 1;
  }

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

  .prompt-text-block:hover {
    outline: 1px solid #9b9da1;
  }

  /* This will apply the outline when the textarea (or any input) inside is focused */
  .prompt-text-block:focus-within {
    outline: 2px solid #6894f9;
  }

  .actionBtn-outline {
    border-radius: 4px;
    border: 2px solid #414858;
    padding: 4px;
  }

  .prompt-text-block {
    display: flex;
    flex-direction: column;
    height: 100%; /* Ensures full height */
    position: relative; /* Allows absolute positioning for .actions-container */
    background-color: #222630 !important;
    /* transition: outline 0.2s ease-in-out; */
  }

  .prompt-text-field-area {
    flex-grow: 1;
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 4px;
    padding: 8px;
    font-family: "inter", sans-serif;
    font-size: 12px;
    font-weight: 400;
  }

  .actions-container {
    width: 95%;
    height: 28px;
    margin: auto;
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #222630;
    /* padding: 8px; */
    border-radius: 4px;
  }
</style>
