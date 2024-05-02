<script lang="ts">
  import type { BasicAuth } from "$lib/utils/interfaces/request.interface";
  import { CodeMirrorInput } from "@workspaces/common/components";
  import { AuthInputTheme } from "@workspaces/common/utils";

  export let callback;
  export let basicAuth: BasicAuth;
  export let environmentVariables;

  const theme = new AuthInputTheme().build();
  const handleInput = () => {
    callback({ basicAuth: basicAuth });
  };
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div class="mb-4" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-requestBodyColor">Username</p>
    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:urlText={basicAuth.username}
        onUpdateRequestUrl={() => {
          handleInput();
        }}
        placeholder={"Enter Username"}
        {theme}
        {environmentVariables}
      />
    </div>
  </div>

  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-requestBodyColor">Password</p>

    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:urlText={basicAuth.password}
        onUpdateRequestUrl={() => {
          handleInput();
        }}
        placeholder={"Enter Password"}
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
