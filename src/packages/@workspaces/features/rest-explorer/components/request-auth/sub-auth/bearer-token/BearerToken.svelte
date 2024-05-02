<script lang="ts">
  import { AuthInputTheme } from "@workspaces/common/utils";
  import { CodeMirrorInput } from "@workspaces/common/components";

  export let bearerToken: string;
  export let callback;
  export let environmentVariables;

  const theme = new AuthInputTheme().build();
  const handleInput = () => {
    callback({ bearerToken: bearerToken });
  };
</script>

<div class="d-flex flex-column w-100 pt-4 pe-1">
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-requestBodyColor">Token</p>
    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:urlText={bearerToken}
        onUpdateRequestUrl={() => {
          handleInput();
        }}
        placeholder={"Enter Token"}
        {theme}
        {environmentVariables}
      />
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    max-width: 600px;
  }
</style>
