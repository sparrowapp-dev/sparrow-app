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
  <div
    class="col-12 d-flex justify-content-between mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="col-2 mb-0 text-requestBodyColor">Token</p>
    <div class="col-10 ps-2 position-relative">
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
