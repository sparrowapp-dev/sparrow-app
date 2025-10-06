<script lang="ts">
  import { CodeMirrorInput } from "../../../../components";
  import { TestFlowNameTheme} from "../../../../utils";
  export let onUpdateTestFlowName: (
    testFlowName: string,
    value: string,
  ) => void;
  export let testFlowName: string;

  const theme = new  TestFlowNameTheme().build();
</script>

<div
  class="d-flex align-items-center justify-content-center text-fs-12  position-relative"
  style="max-width: 500px; min-width: 90px;"
>
 
    <CodeMirrorInput
    bind:value={testFlowName}
    onUpdateInput={ async() =>{
       onUpdateTestFlowName(testFlowName, "");
    }}
    placeholder={""}
    {theme}
    enableEnvironmentHighlighting={false}
      />
 </div>

<style>
  .input-name-container {
    border: 1px solid var(--border-color);
    position: relative;
    border: 1px solid transparent;
    gap: 2px;
    
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
    caret-color: var(--border-ds-primary-300);
  }
  .input-name-container:focus-within {
    border-color: var(--border-ds-primary-300);
    caret-color: var(--border-ds-primary-300);
  }
</style>
