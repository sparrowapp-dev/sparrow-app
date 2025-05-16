<script lang="ts">
  import { TextEditor } from "@sparrow/library/forms";

  export let onUpdateAiSystemPrompt;
  export let requestDoc: string;
</script>

<div class=" text-fs-14">
  <div
    style="height: 100%; min-height:160px;background-color: var(--bg-ds-surface-600);border-radius:4px;padding:8px;display:flex;flex-direction:column;gap:4px;"
    class="area"
  >
    <div on:keydown|stopPropagation on:keyup|stopPropagation>
      <div id="editor2">
        <TextEditor
          placeholder={"Give the modal context to understand the task and provide tailored responses."}
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
  .area:hover {
    border: 1px solid var(--border-primary-300) !important;
  }
  .area:hover {
    background-color: var(--bg-secondary-450) !important;
  }
  .area::selection {
    background-color: black !important;
  }
</style>
