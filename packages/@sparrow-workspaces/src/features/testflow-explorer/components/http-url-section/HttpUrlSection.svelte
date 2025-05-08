<script lang="ts">
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";

  export let requestUrl;
  export let onUpdateRequestUrl;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let userRole;
  export let handleOpenCurrentDynamicExpression;

  const theme = new UrlInputTheme().build();

  export let dispatcher;
</script>

<div style="position:relative; width:100%">
  <div class="w-100 d-flex align-items-center position-relative">
    <div class="position-absolute top-0" style="width: calc(100% );">
      <CodeMirrorInput
        value={requestUrl}
        onUpdateInput={onUpdateRequestUrl}
        placeholder={"Enter a URL"}
        {theme}
        {onUpdateEnvironment}
        {environmentVariables}
        codeId={"url"}
        class={"testflow-input-url"}
        {userRole}
        handleOpenDE={handleOpenCurrentDynamicExpression}
        isFocusedOnMount={false}
        bind:dispatcher
      />
    </div>
  </div>
</div>

<style>
  :global(.testflow-input-url) {
    width: 100%;
    flex: 1;
  }
</style>
