<script lang="ts">
  import { TextEditor } from "@sparrow/library/forms";

  export let onUpdateAiSystemPrompt;
  export let requestDoc: string;
  export let isEditable: boolean = false;
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
</style>
