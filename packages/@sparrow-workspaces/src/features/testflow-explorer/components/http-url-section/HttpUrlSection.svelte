<script lang="ts">
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";

  export let requestUrl;
  export let onUpdateRequestUrl;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let userRole;

  const theme = new UrlInputTheme().build();
</script>

<div style="position:relative; width:100%">
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
    isFocusedOnMount={true}
  />
</div>

<style>
  :global(.testflow-input-url) {
    width: 100%;
    flex: 1;
  }
</style>
