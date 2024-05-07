<script lang="ts">
  import Select from "$lib/components/inputs/select/Select.svelte";
  import { AuthSection } from "$lib/utils/enums/authorization.enum";
  import type { ApiKey } from "$lib/utils/interfaces/request.interface";
  import { CodeMirrorInput } from "@workspaces/common/components";
  import { AuthInputTheme } from "@workspaces/common/utils";
  export let apiData: ApiKey;
  export let callback;
  export let environmentVariables;
  export let onUpdateEnvironment;
  const theme = new AuthInputTheme().build();

  const handleAuthChange = () => {
    callback({ apiKey: apiData });
  };

  const handleOptionChange = (event) => {
    apiData.addTo = event.target.value;
    callback({ apiKey: apiData });
  };
</script>

<div>
  <p class="text-secondary-300 text-fs-12 fw-normal">
    The authorization header will be automatically generated when you send the
    request.
  </p>
</div>
<div class="pt-2 d-flex gap-3">
  <label class="text-fs-12 d-flex align-items-center">
    <input
      type="radio"
      name="options"
      value={AuthSection.HEADER}
      bind:group={apiData.addTo}
      on:change={handleOptionChange}
    />
    <span class="ps-2"> Add to Header </span>
  </label>

  <label class="text-fs-12 d-flex align-items-center">
    <input
      type="radio"
      name="options"
      value={AuthSection.QUERY_PARAMETER}
      bind:group={apiData.addTo}
      on:change={handleOptionChange}
    />
    <span class="ps-2"> Add to Parameter </span>
  </label>
</div>
<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class=" mb-2 text-secondary-100">Auth Key</p>

    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:urlText={apiData.authKey}
        onUpdateRequestUrl={() => {
          handleAuthChange();
        }}
        placeholder={"Key"}
        {theme}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    </div>
  </div>
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Auth Value</p>
    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:urlText={apiData.authValue}
        onUpdateRequestUrl={() => {
          handleAuthChange();
        }}
        placeholder={"Value"}
        {theme}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    max-width: 600px;
  }
</style>
