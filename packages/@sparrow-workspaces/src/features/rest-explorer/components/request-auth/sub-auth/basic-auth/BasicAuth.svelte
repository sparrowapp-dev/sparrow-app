<script lang="ts">
  import type { BasicAuth } from "@sparrow/common/interfaces/request.interface";
  import { CodeMirrorInput } from "@sparrow/workspaces/components";
  import { AuthInputTheme } from "@sparrow/workspaces/utils";

  export let callback;
  export let basicAuth: BasicAuth;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let disabled = false;

  const theme = new AuthInputTheme().build();
  const handleInput = () => {
    callback({ basicAuth: basicAuth });
  };
</script>

<div class="w-100">
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Username</p>

    <div class="position-relative mb-2" style="padding-bottom: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={basicAuth.username}
          onUpdateInput={() => {
            handleInput();
          }}
          placeholder={"Username"}
          {theme}
          {disabled}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>

  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Password</p>

    <div class="position-relative" style="padding-bottom: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={basicAuth.password}
          onUpdateInput={() => {
            handleInput();
          }}
          placeholder={"Password"}
          {theme}
          {disabled}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    width: 615px;
  }
</style>
