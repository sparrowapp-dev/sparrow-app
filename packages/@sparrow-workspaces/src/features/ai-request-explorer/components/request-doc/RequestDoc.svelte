<script lang="ts">
  import { TextEditor } from "@sparrow/library/forms";
  import { BotSparkleFilled } from "@sparrow/library/icons";
  import { Tooltip } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { SystemPromptTheme } from "../../../../utils/";

  export let onUpdateAiSystemPrompt;
  export let requestDoc: string;
  export let isEditable: boolean = false;
  export let activateGeneratePromptModal;
  export let isAutoPromptGenerationInProgress = true;
  export let isGuestUser: boolean;
  export let environmentVariables;
  export let onUpdateEnvironment = () => {};

  const theme = new SystemPromptTheme().build();
</script>

<div class="request-doc-wrapper {isEditable ? 'disabled' : ''}">
  <div on:keydown|stopPropagation on:keyup|stopPropagation>
    <div id="editor2" class="editor-wrapper">
      <CodeMirrorInput
        value={requestDoc}
        onUpdateInput={(val) => onUpdateAiSystemPrompt(val)}
        placeholder="Give the model context to understand the task and provide tailored responses."
        {theme}
        {environmentVariables}
        {onUpdateEnvironment}
        isReadOnly={isAutoPromptGenerationInProgress ? true : false}
        isNewLineOnEnter={true}
        isNewLineOnShiftEnter={true}
      />

      {#if isEditable && !isAutoPromptGenerationInProgress}
        <div class="generate-btn-inside">
          <button
            on:click={() => activateGeneratePromptModal("SystemPrompt")}
            disabled={isGuestUser}
            class="generate-prompt-btn d-flex align-items-center gap-1 px-2 py-1 rounded-1"
          >
            <BotSparkleFilled size={"15px"} color="#4387f4" />
            <span class="text-ds-font-size-12 fw-medium">
              Generate System Prompt
            </span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .disabled {
    /* Add your disabled styles if needed */
  }

  .editor-wrapper {
    position: relative;
    width: 100%;
  }

  .generate-btn-inside {
    position: absolute;
    bottom: 6px;
    left: 10px;
    z-index: 10;
    background-color: var(--bg-ds-surface-600);
    padding: 2px 4px;
    border-radius: 4px;
  }

  .generate-prompt-btn {
    font-family: Inter, sans-serif;
    background-color: var(--bg-ds-surface-400);
    color: var(--sparrow-white);
    border: 1px solid var(--bg-ds-surface-100);
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease; /* Smooth hover */
  }

  .generate-prompt-btn:hover {
    background-color: var(--bg-ds-surface-700);
    border: 1px solid var(--border-ds-primary-400);
    box-shadow: 0 0 4px 1px rgba(17, 173, 240, 0.3); /* shadow-glow effect */
  }
</style>
