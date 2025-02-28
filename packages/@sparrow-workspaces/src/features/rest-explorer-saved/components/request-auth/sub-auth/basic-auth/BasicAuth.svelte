<script lang="ts">
  import type { BasicAuth } from "@sparrow/common/interfaces/request.interface";
  import { CodeMirrorInput } from "@sparrow/workspaces/components";
  import { AuthInputTheme } from "@sparrow/workspaces/utils";

  export let callback;
  export let basicAuth: BasicAuth;
  export let environmentVariables;
  export let onUpdateEnvironment;

  const theme = new AuthInputTheme().build();
  const handleInput = () => {
    callback({ basicAuth: basicAuth });
  };
</script>

<div>
  <p class="text-secondary-300 text-fs-12 fw-normal">
    The authorization header will be automatically generated when you send the
    request.
  </p>
</div>
<div class="w-100 ps-1 pt-2 pe-1">
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Username</p>
    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:value={basicAuth.username}
        onUpdateInput={() => {
          handleInput();
        }}
        placeholder={"Username"}
        {theme}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    </div>
  </div>

  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Password</p>

    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:value={basicAuth.password}
        onUpdateInput={() => {
          handleInput();
        }}
        placeholder={"Password"}
        {theme}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    max-width: 615px;
  }
</style>
