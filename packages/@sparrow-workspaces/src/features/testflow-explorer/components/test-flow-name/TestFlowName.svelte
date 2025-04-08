<script lang="ts">
  export let onUpdateTestFlowName: (
    testFlowName: string,
    value: string,
  ) => void;
  export let testFlowName: string;
</script>

<div
  class="d-flex align-items-center justify-content-center text-fs-12 input-name-container py-1 px-2"
  style="width: 81px;"
>
  <input
    type="text"
    bind:value={testFlowName}
    class={`bg-transparent w-100 border-0 my-auto`}
    on:input={async (e) => {
      await onUpdateTestFlowName(testFlowName, "");
    }}
    on:blur={async (e) => {
      await onUpdateTestFlowName(testFlowName, "blur");
    }}
  />
</div>

<style>
  .input-name-container {
    border: 1px solid var(--border-color);
    background: var(--bg-ds-surface-400);
    position: relative;
    border: 1px solid transparent;
    gap: 2px;
    height: 36px;
    border-radius: 4px;
  }
  .input-name-container > input:focus {
    outline: none;
    caret-color: var(--workspace-hover-color);
  }
  .input-name-container:focus-within {
    border: 1px solid var(--workspace-hover-color);
  }

  .input-name-container:hover {
    border: 1px solid var(--border-ds-primary-300);
    caret-color: var(--border-ds-primary-300);
  }
  .input-name-container:focus-within {
    border-color: var(--border-ds-primary-300);
    caret-color: var(--border-ds-primary-300);
  }
</style>
