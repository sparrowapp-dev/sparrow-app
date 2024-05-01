<script lang="ts">
  import Select from "$lib/components/inputs/select/Select.svelte";
  import { AuthSection } from "$lib/utils/enums/authorization.enum";
  import type { ApiKey } from "$lib/utils/interfaces/request.interface";
  import { CodeMirrorInput } from "@workspaces/common/components";
  import { AuthInputTheme } from "@workspaces/common/utils";
  export let apiData: ApiKey;
  export let callback;
  export let environmentVariables;
  const theme = new AuthInputTheme().build();

  const handleAuthChange = () => {
    callback({ apiKey: apiData });
  };

  const handleDropdown = (
    tab: AuthSection.HEADER | AuthSection.QUERY_PARAMETER,
  ) => {
    apiData.addTo = tab;
    callback({ apiKey: apiData });
  };
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="col-12 d-flex align-items-center justify-content-between mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="col-2 mb-0 text-requestBodyColor">Auth Key</p>

    <div class="col-10 ps-2 position-relative">
      <CodeMirrorInput
        bind:urlText={apiData.authKey}
        onUpdateRequestUrl={() => {
          handleAuthChange();
        }}
        placeholder={"Enter Auth Key"}
        {theme}
        {environmentVariables}
      />
    </div>
  </div>
  <div
    class="col-12 d-flex align-items-center justify-content-between mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="col-2 mb-0 text-requestBodyColor">Auth Value</p>
    <div class="col-10 ps-2 position-relative">
      <CodeMirrorInput
        bind:urlText={apiData.authValue}
        onUpdateRequestUrl={() => {
          handleAuthChange();
        }}
        placeholder={"Enter Auth Value"}
        {theme}
        {environmentVariables}
      />
    </div>
  </div>
  <div
    class="col-12 d-flex justify-content-between text-requestBodyColor"
    style="font-size: 12px; font-weight:500"
  >
    <p class="col-2 mt-3 mb-0" style="margin-top: 0.8rem !important;">Add to</p>
    <div class="col-10 p-2 ps-0 position-relative">
      <button class="bg-backgroundColor border-0">
        <p class="">
          <Select
            id={"hash156"}
            data={[
              {
                name: "Header",
                id: AuthSection.HEADER,
              },
              {
                name: "Query Parameter",
                id: AuthSection.QUERY_PARAMETER,
              },
            ]}
            titleId={apiData.addTo}
            onclick={handleDropdown}
            headerTheme={"transparent"}
            borderType={"none"}
            borderActiveType={"bottom"}
            borderHighlight={"hover-active"}
            headerHighlight={"active"}
            minBodyWidth={"150px"}
            borderRounded={false}
            menuItem={"v2"}
          />
        </p>
      </button>
    </div>
  </div>
</div>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
