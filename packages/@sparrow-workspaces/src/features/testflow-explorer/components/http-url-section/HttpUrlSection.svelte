<script lang="ts">
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";

  let componentClass = "";
  export { componentClass as class };

  export let requestUrl;
  export let onUpdateRequestUrl;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let userRole;

  const theme = new UrlInputTheme().build();
</script>

<div class={`d-flex ${componentClass}`} style="display: flex; gap: 6px;">
  <CodeMirrorInput
    value={requestUrl}
    onUpdateInput={onUpdateRequestUrl}
    placeholder={"Enter a URL"}
    {theme}
    {onUpdateEnvironment}
    {environmentVariables}
    codeId={"url"}
    class={"input-url"}
    {userRole}
    isFocusedOnMount={true}
  />
</div>

<style>
  :global(.url-red-border) {
    border: 1px solid var(--border-danger-200) !important;
  }
</style>
