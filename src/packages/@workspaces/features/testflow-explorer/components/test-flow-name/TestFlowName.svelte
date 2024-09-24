<script>
  export let handleTestFlowNameChange;
  export let testFlowName;
</script>

<div
  style=""
  class={`d-flex align-items-center justify-content-center text-fs-12 input-name-container  py-1 px-2 `}
>
  <input
    type="text"
    id="search-input"
    class={`bg-transparent w-100 border-0 my-auto`}
    on:input={(e) => {
      testFlowName = e.target.value;
      handleTestFlowNameChange(testFlowName, "");
    }}
    on:blur={(e) => {
      handleTestFlowNameChange(testFlowName, "blur");
    }}
    value={testFlowName}
  />
</div>

<style>
  .input-name-container {
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary-400);
    max-width: 20vw;
    position: relative;
    border: 1px solid transparent;
    gap: 2px;
    height: 36px;
  }

  .input-name-container > input:focus {
    outline: none;
    caret-color: var(--workspace-hover-color);
  }
  .input-name-container:focus-within {
    border: 1px solid var(--workspace-hover-color);
  }

  .input-name-container:hover {
    border: 1px solid var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }
  .input-name-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }
</style>
