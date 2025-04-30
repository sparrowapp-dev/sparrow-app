<script lang="ts">
  import type { BasicAuth } from "@sparrow/common/interfaces/request.interface";
  import { MathFormulaRegular } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
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

  export let handleOpenCurrentDynamicExpression;
  let usernameDispatcher;
  let passwordDispatcher;
</script>

<div class="w-100">
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Username</p>
    <div class="position-relative" style="padding-bottom: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={basicAuth.username}
          onUpdateInput={() => {
            handleInput();
          }}
          placeholder={"Username"}
          {theme}
          {environmentVariables}
          {onUpdateEnvironment}
          {disabled}
          bind:dispatcher={usernameDispatcher}
          handleOpenDE={(obj) => {
            handleOpenCurrentDynamicExpression({
              ...obj,
              type: "username",
            });
          }}
        />
        <Button
          size="extra-small"
          type="teritiary-regular"
          startIcon={MathFormulaRegular}
          onClick={() => {
            handleOpenCurrentDynamicExpression({
              type: "username",
              dispatch: usernameDispatcher,
            });
          }}
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
          {environmentVariables}
          {onUpdateEnvironment}
          {disabled}
          bind:dispatcher={passwordDispatcher}
          handleOpenDE={(obj) => {
            handleOpenCurrentDynamicExpression({
              ...obj,
              type: "password",
            });
          }}
        />
        <Button
          size="extra-small"
          type="teritiary-regular"
          startIcon={MathFormulaRegular}
          onClick={() => {
            handleOpenCurrentDynamicExpression({
              type: "password",
              dispatch: passwordDispatcher,
            });
          }}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    max-width: 615px;
    width: 100%;
  }
</style>
