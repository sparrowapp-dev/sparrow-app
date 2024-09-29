<script lang="ts">
  import { Events } from "@deprecate/utils/enums";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { GenerateIcon, SendIcon } from "@sparrow/library/icons";

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
</script>

<div class="d-flex prompt-input p-3">
  <div class="position-relative w-100">
    <input
      type=""
      bind:value={prompt}
      on:input={() => {
        onUpdateAiPrompt(prompt);
      }}
      class="w-100 pe-5 py-2 ps-2 border-radius-6 text-fs-12"
      autofocus
      style="border:1px solid grey; outline: none; background-color: var(--bg-secondary-1100); border: 1px solid var(--border-tertiary-190); "
      {placeholder}
      on:keydown={(event) => {
        if (event.key === "Enter" && prompt && !isResponseGenerating) {
          sendPrompt(prompt);
          onUpdateAiPrompt("");
        }
      }}
    />

    {#if !isResponseGenerating}
      <div
        style="position:absolute; right:12px ; top: 50%; 
        transform : translateY(-60%);
      "
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
        <SendIcon
          height={"16px"}
          width={"16px"}
          color={isSendButtonHovered
            ? "var(--icon-primary-300)"
            : "var(--icon-secondary-100)"}
        />
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
  input::placeholder {
    color: var(--text-secondary-250);
  }
  input {
    border: 1px solid transparent;
  }
  input:focus {
    outline: none;
    border: 1px solid var(--border-primary-300) !important;
  }
</style>
