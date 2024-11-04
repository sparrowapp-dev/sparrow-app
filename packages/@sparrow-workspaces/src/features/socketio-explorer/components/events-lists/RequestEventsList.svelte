<script lang="ts">
  import { inview } from "svelte-inview";
  import { trashIcon as trashIcon } from "@sparrow/library/assets";
  // import { CodeMirrorInput } from "../";
  import { Tooltip } from "@sparrow/library/ui";
  import type {
    ObserverEventDetails,
    ScrollDirection,
    Options,
  } from "svelte-inview";
  import { Input, Switch } from "@sparrow/library/forms";
  import { CodeMirrorInput } from "../../../../components";

  export let element;
  export let index;
  export let pairs;
  export let theme;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let updateParam;
  export let updateCheck;
  export let deleteParam;
  export let isInputBoxEditable;
  export let isCheckBoxEditable;

  let isInView: boolean = false;
  let scrollDirection: ScrollDirection | any;
  const options: Options = {
    rootMargin: "0px",
    unobserveOnEnter: true,
    threshold: 0.5,
  };

  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
    isInView = detail.inView;
    scrollDirection = detail?.scrollDirection?.vertical;
  };
</script>

<div style="background-color: #161617;">
  <div
    class="ps-5 pe-2 d-flex justify-content-between align-items-center bg-secondary-700 w-100"
    style="font-size: 12px; font-weight: 500; margin-bottom: 4px;"
  >
    <div
      class="position-relative  w-50 d-flex justify-content-between align-items-center"
    >
      <div class="w-100 me-2 ms-1">
        <Input
          id={`environment-search}`}
          type="text"
          bind:value={element.event}
          on:input={() => updateParam(index)}
          width={"100%"}
          height={"20px"}
          class="text-fs-12 me-5 bg-secondary-600"
          style="outline:none; background-color:transparent;"
          placeholder="Name"
          defaultBorderColor="transparent"
          hoveredBorderColor={"var(--border-primary-300)"}
          focusedBorderColor={"var(--border-primary-300)"}
          isEditIconRequired={false}
        />
      </div>
      <div class="me-1 mt-1">
        {#if true}
          <Switch
            checked={element.listen}
            onChange={() => {
              updateCheck(index);
            }}
          />
        {:else}
          <div style="width: 24px;"></div>
        {/if}
      </div>
    </div>

    {#if index !== pairs.length - 1}
      <Tooltip title={"Delete"} placement={"bottom-left"} distance={10}>
        <button
          class="bg-secondary-700 d-flex justify-content-center align-items-center border-0"
          style="width: 24px; height:16px; padding-end"
          on:click={() => deleteParam(index)}
        >
          <img class="trash-icon" src={trashIcon} alt="" />
        </button>
      </Tooltip>
    {/if}
  </div>
</div>

<style>
  .trash-icon:hover {
    background-color: var(--bg-secondary-500);
  }
</style>
