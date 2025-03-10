<script lang="ts">
  import { CodeMirrorInput } from "@sparrow/workspaces/components";
  import { AuthInputTheme } from "@sparrow/workspaces/utils";
  import { RadioButton } from "@sparrow/library/ui";
  import { CollectionRequestAddToBaseEnum } from "@sparrow/common/types/workspace/collection-base";
  export let apiData;
  export let callback;
  export let environmentVariables;
  export let onUpdateEnvironment;
  const theme = new AuthInputTheme().build();

  const handleAuthChange = () => {
    callback({ apiKey: apiData });
  };

  const handleOptionChange = (event: any) => {
    apiData.addTo = event.target.value;
    callback({ apiKey: apiData });
  };
</script>

<div class="pt-2 d-flex gap-3">
  <div class="radio text-fs-12 d-flex align-items-center">
    <RadioButton
      id="radio-1"
      name="radio"
      value={CollectionRequestAddToBaseEnum.HEADER}
      group={apiData.addTo}
      handleChange={handleOptionChange}
      labelText=" Add to Header "
      buttonSize="small"
      disabled={true}
    />
  </div>
  <div class="radio text-fs-12 d-flex align-items-center">
    <RadioButton
      id="radio-2"
      name="radio"
      value={CollectionRequestAddToBaseEnum.QUERY_PARAMETER}
      group={apiData.addTo}
      handleChange={handleOptionChange}
      labelText=" Add to Parameter "
      buttonSize="small"
      disabled={true}
    />
  </div>
</div>
<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class=" mb-2 text-secondary-100">Key</p>

    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:value={apiData.authKey}
        onUpdateInput={() => {
          handleAuthChange();
        }}
        placeholder={"Enter auth key"}
        {theme}
        {environmentVariables}
        {onUpdateEnvironment}
        disabled={true}
      />
    </div>
  </div>
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Value</p>
    <div class="position-relative auth-input-container">
      <CodeMirrorInput
        bind:value={apiData.authValue}
        onUpdateInput={() => {
          handleAuthChange();
        }}
        placeholder={"Enter auth value"}
        {theme}
        {environmentVariables}
        {onUpdateEnvironment}
        disabled={true}
      />
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    max-width: 615px;
  }

  .radio {
    margin: 0.5rem;
    outline: none;
    position: relative;
  }
  .radio input[type="radio"] {
    position: absolute;
    opacity: 0;
  }
  .radio input[type="radio"] + .radio-label:before {
    content: "";
    background: var(--text-secondary-150);
    border-radius: 100%;
    border: 2px solid var(--bg-primary-400);
    display: inline-block;
    width: 14px;
    height: 14px;
    position: relative;
    top: 3px;
    margin-right: 0.5em;
    cursor: pointer;
    text-align: center;
    transition: all 250ms ease;
  }
  .radio input[type="radio"]:checked + .radio-label:before {
    background-color: var(--bg-primary-400);
    border-width: 1.5px;
    border-color: var(--text-secondary-150);
  }
  .radio input[type="radio"]:checked + .radio-label:after {
    content: "";
    position: absolute;
    top: 7.5px;
    left: 4.5px;
    height: 5px;
    width: 5px;
    border-radius: 100%;
    background-color: var(--text-secondary-150);
    z-index: 100;
  }
  .radio input[type="radio"]:focus + .radio-label:before {
    outline: none;
    /* border-color: #3197ee; */
  }
  .radio input[type="radio"] + .radio-label:empty:before {
    margin-right: 0;
  }
</style>
