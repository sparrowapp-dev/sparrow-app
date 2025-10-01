<script lang="ts">
  import { AuthInputTheme } from "@sparrow/workspaces/utils";
  import { CodeMirrorInput } from "@sparrow/workspaces/components";
  import { Button } from "@sparrow/library/ui";
  import { MathFormulaRegular } from "@sparrow/library/icons";

  export let bearerToken: string;
  export let callback;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let disabled = false;

  const theme = new AuthInputTheme().build();
  const handleInput = () => {
    callback({ bearerToken: bearerToken });
  };

  let dispatcher;
  export let handleOpenCurrentDynamicExpression;
</script>

<div class="d-flex flex-column w-100">
  <div style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Token</p>
    <div class="position-relative auth-input-container mb-3">
      <div class="d-flex gap-2">
        <CodeMirrorInput
          bind:value={bearerToken}
          onUpdateInput={() => {
            handleInput();
          }}
          placeholder={"Token"}
          {theme}
          {environmentVariables}
          {onUpdateEnvironment}
          {disabled}
          bind:dispatcher
          handleOpenDE={(obj) => {
            handleOpenCurrentDynamicExpression({
              ...obj,
              type: "bearerToken",
            });
          }}
        />
        <Button
          size="medium"
          type="teritiary-regular"
          startIcon={MathFormulaRegular}
          onClick={() => {
            handleOpenCurrentDynamicExpression({
              type: "bearerToken",
              dispatch: dispatcher,
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
  }
</style>
