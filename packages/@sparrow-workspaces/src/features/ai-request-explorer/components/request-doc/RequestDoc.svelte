<script lang="ts">
  import { TextEditor } from "@sparrow/library/forms";
  import { BotSparkleFilled } from "@sparrow/library/icons";
  import { Tooltip } from "@sparrow/library/ui";

  export let onUpdateAiSystemPrompt;
  export let requestDoc: string;
  export let isEditable: boolean = false;
  export let activateGeneratePromptModal;
</script>

<div class="request-doc-wrapper {isEditable ? 'disabled' : ''}">
  <div class="editor-area">
    <div on:keydown|stopPropagation on:keyup|stopPropagation>
      <div id="editor2">
        <TextEditor
          placeholder={"Give the model context to understand the task and provide tailored responses."}
          id={"editor2"}
          onInput={onUpdateAiSystemPrompt}
          value={requestDoc}
          isReadOnly={false}
        />
      </div>
    </div>

    <!-- <div id="generate-prompt-chip" class="" style=""> -->
    <Tooltip title={"Generate system prompt"} placement={"top-center"}>
      <button
        on:click={() => {
          console.log("Generate system prompt clicked");
          activateGeneratePromptModal("SystemPrompt");
        }}
        class="generate-prompt-btn d-flex align-items-center gap-1 px-2 py-1 rounded-1"
      >
        <BotSparkleFilled size={"15px"} color="#4387f4" />
        <span class="text-ds-font-size-12 fw-medium"
          >Generate System Prompt</span
        >
      </button>
    </Tooltip>
    <!-- </div> -->
  </div>
</div>

<style>
  .disabled {
    /* cursor: not-allowed !important;
    opacity: 0.5; */
  }

  .editor-area {
    flex: 1;
    min-height: 80px;
    background-color: var(--bg-ds-surface-600);
    border-radius: 4px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    gap: 4px;
    overflow: auto; /* Add scrollbar when content overflows */
  }

  .editor-area:hover {
    border: 1px solid var(--border-primary-300) !important;
    background-color: var(--bg-secondary-450) !important;
  }

  .generate-prompt-btn {
    background-color: var(--bg-ds-surface-700);
    color: var(--sparrow-white);
    border: 1px solid var(--bg-ds-surface-100);
    font-size: 12px;
    font-weight: 500;
  }
</style>
