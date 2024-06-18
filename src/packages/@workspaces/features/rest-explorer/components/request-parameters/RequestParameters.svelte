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
 
 
  import { Editor } from "@library/forms";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody({ raw: e.detail });
  };
 
  let bulkedit=false;
 
  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestParams(pairs);
  };
 
 
function toggleBulkEdit(event: Event) {
  bulkedit = (event.target as HTMLInputElement).checked;
}
 
</script>
 
<section class="outer-section w-100" style="height: calc(100% - 50px); overflow-y: scroll;">
 
  {#if !bulkedit}
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
   style="font-size:12px; font-weight:500; color:var(--sparrow-text-color)">Bulk edit</div>
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
    <button class="bg-transparent border-0 mt-1 d-flex" style="">
      <p
        class="text-nowrap text-primary-300  mb-0 me-2"
        style="font-size: 10px; font-weight:400;"
      >
        Bulk Edit
      </p>
      <label class="switch">
        <input type="checkbox" id="bulkEditToggle" on:change={toggleBulkEdit}>
        <span class="slider round"></span>
      </label>
    </button>
    <button class="bg-transparent border-0 d-flex " style="">
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
  .bulkEdit-div{
    position: absolute;
    right: 0;
    top: 0;
    /* border: 1px solid red; */
  }
 
  .outer-section{
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
  transition: .4s;
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
  transition: .4s;
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