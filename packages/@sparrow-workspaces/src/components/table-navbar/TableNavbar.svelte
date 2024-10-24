<script>
  import { ArrowOutwardIcon, CrossIcon } from "@sparrow/library/icons";
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";
  import { Tooltip } from "@sparrow/library/ui";
  import TestFlowTourGuide from "../test-flow-tour-guide/TestFlowTourGuide.svelte";
  import { currentStep, isTestFlowTourGuideOpen } from "../../stores";

  export let selectedNode;

  export let onClose;
  export let onRedirect;

</script>

<div
  class="d-flex align-items-center justify-content-between p-1 ps-2 pe-2"
  style="position:relative; height:34px; background-color:var(--bg-tertiary-300); border-bottom:1px solid #4B4F6B ;"
>
  <div
    class="d-flex align-items-center justify-content-start gap-2"
    style="width:calc(100% - 50px)"
  >
    <div
      class="d-flex align-items-center border-radius-4 text-fs-10 mb-0 px-2 method-container text-{getMethodStyle(
        selectedNode?.request?.property?.request?.method,
      )}"
      style="margin-bottom:0px; padding-top:2px; padding-bottom:2px;"
    >
      <span>
        {selectedNode?.request?.property?.request?.method}
      </span>
    </div>
    <p
      class="text-fs-12 mb-0 pb-0 ellipsis"
      style="color:var(--text-secondary-270); margin-bottom:0px; padding-bottom:0px;"
    >
      {selectedNode?.request?.name}
    </p>
    {#if selectedNode?.request?.property?.request?.url}
      <div
        style="height: 12px; width:1px; background-color:var(--bg-secondary-270); border:1px solid #D7D7D7 "
      ></div>
    {/if}
    <p
      class="text-fs-12 mb-0 pb-0 ellipsis"
      style="color:var(--text-secondary-270); font-weight:400;"
    >
      {selectedNode?.request?.property?.request?.url}
    </p>
  </div>
  <div class="d-flex gap-2 align-items-center" style="cursor:pointer ; ">
    <Tooltip title="Redirect" placement={"bottom"} zIndex={100}>
      <span on:click={onRedirect} class="pe-2">
        <ArrowOutwardIcon
          width={"8px"}
          height={"8px"}
          color={"var(  --icon-secondary-200)"}
        />
      </span>
    </Tooltip>
    <Tooltip title="Close" placement={"bottom-left"} zIndex={100}>
      <span on:click={onClose} class="pe-2">
        <CrossIcon
          width={"14px"}
          height={"14px"}
          color={"var(--icon-secondary-200)"}
        />
      </span>
    </Tooltip>
  </div>

  {#if $isTestFlowTourGuideOpen && $currentStep == 7}
    <div style="position:absolute; bottom:250px; right:318px;">
      <TestFlowTourGuide
        isLastStep={true}
        isPuleCircleRequired={false}
        title="Congratulations! 🎊"
        pulsePosition={{ top: "210px", left: "250px" }}
        description={`Great work! You’ve got one successful running flow. Below in the table, you’ll find this icon, which will take you to the API if you need to tweak any values.`}
        tipPosition="bottom-right"
        onNext={() => {
          currentStep.set(-1);
          isTestFlowTourGuideOpen.set(false);
        }}
        onClose={() => {
          isTestFlowTourGuideOpen.set(false);
        }}
      />
    </div>
  {/if}
</div>

<style>
  .method-container {
    border: 1px solid var(--border-tertiary-400);
    background-color: var(--bg-tertiary-400);
  }
</style>
