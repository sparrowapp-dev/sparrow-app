<script lang="ts">
  import { TabularInput } from "@workspaces/common/components";
  import { createDeepCopy } from "$lib/utils/helpers";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";
  import moreOptions from "@workspaces/features/rest-explorer/assets/icons/moreOptions.svg";
  export let params;
  export let onUpdateRequestParams;
  export let environmentVariables = [];
  export let authParameter;
  export let onUpdateEnvironment;

  export let tab: Observable<RequestTab>;

  import { Editor } from "@library/forms";
  import ErrorIcon from "@library/icons/ErrorIcon.svelte";
  import { InfoIcon } from "@library/icons";
  import RestExplorerViewModel from "@app/pages/RestExplorer/RestExplorerPage.ViewModel";
  import type { Observable } from "rxjs";
  import type { RequestTab } from "@common/types/workspace";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody({ raw: e.detail });
  };
  import { writable } from "svelte/store";
  import { onMount } from "svelte";

  const bulkedit = writable(false);

  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestParams(pairs);
  };

  const _viewModel = new RestExplorerViewModel(tab);

  onMount(async () => {
    try {
      const initialBulkEditToggle = await _viewModel.getBulkEditToggle(tab);
      bulkedit.set(initialBulkEditToggle ?? false);
    } catch (error) {
      console.error("Failed to fetch bulkEditToggle from database:", error);
    }
  });

  function toggleBulkEdit(event) {
    const isChecked = event.target.checked;
    bulkedit.set(isChecked);

    // Update bulk edit toggle in the ViewModel and database
    _viewModel.updateBulkEditToggle(tab);
  }
</script>

<section
  class="outer-section w-100"
  style="height: calc(100% - 50px); overflow-y: scroll;"
>
  {#if !$bulkedit}
    <div class="input-div">
      <TabularInput
        readable={authParameter}
        keyValue={createDeepCopy(params)}
        callback={handleParamsChange}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    </div>
  {:else}
    <div
      style="font-size:12px; font-weight:500; color:var(--sparrow-text-color)"
    >
      Bulk edit
    </div>
    <div class="request-body position-relative">
      <Editor
        bind:lang
        bind:value
        on:change={handleCodeMirrorChange}
        isEditable={true}
        {isBodyBeautified}
        beautifySyntaxCallback={updateBeautifiedState}
      />
    </div>
  {/if}

  <div class="bulkEdit-div pe-1 d-flex align-items-center gap-1">
    <div
      class="d-none align-items-center rounded-1 justify-content-center position-relative"
      style="height: 18px; width:18px;  background-color:var(--bg-tertiary-300); "
    >
      <div
        class=" p-2 position-absolute text-fs-12 bg-tertiary-650 border-radius-2"
        style="top:100px; right: 30px; width: 290px; transform: translateY(-100%);"
      >
        <div class="pb-2 d-flex">
          <span>
            <ErrorIcon
              height={"17px"}
              width={"17px"}
              color={"var(--dangerColor)"}
            /></span
          >
          <span class="ps-2 text-fs-14 text-whitecolor">Syntax Error</span>
        </div>
        <p class="mb-0">
          Please verify the syntax for keys and values, and ensure you follow
          the correct format when adding them. For example: userId:12345.
        </p>
      </div>

      <ErrorIcon height={"12px"} width={"12px"} color={"var(--dangerColor)"} />
    </div>

    <button class="bg-transparent border-0 mt-1 d-flex" style="">
      <p
        class="text-nowrap text-primary-300 mb-0 me-2"
        style="font-size: 10px; font-weight:400;"
      >
        Bulk Edit
      </p>
      <label class="switch">
        <input
          type="checkbox"
          bind:checked={$bulkedit}
          on:change={toggleBulkEdit}
        /> <span class="slider round"></span>
      </label>
    </button>
    <button class="bg-transparent border-0 d-flex" style="">
      <img
        class="my-auto"
        src={moreOptions}
        alt="Edit Icon"
        style="height: 10px; width: 10px;"
      />
    </button>
    <div class="h-75 pe-1">
      <button class="border-0" style="width:0px;" />
    </div>
  </div>
</section>

<style>
  .bulkEdit-div {
    position: absolute;
    right: 0;
    top: 0;
    /* border: 1px solid red; */
  }

  .outer-section {
    position: relative;
  }

  /* The switch - the container */
  .switch {
    position: relative;
    display: inline-block;
    width: 22px;
    height: 12px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--text-secondary-500);
    transition: 0.4s;
    border-radius: 16px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 8px;
    width: 8px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--text-primary-200);
  }

  input:checked + .slider:before {
    transform: translateX(10px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 16px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>




