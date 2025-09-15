<script>
  import {
    generatedVariableDemo,
    generateVariableStep,
  } from "../../../stores/generate-variable-demo";
  import TourguideOverlay from "../components/TourguideOverlay.svelte";
  import { GenerateVariableTourContent } from "../utils";
  $: currentStepData = GenerateVariableTourContent.find(
    (step) => step.stepCount === $generateVariableStep,
  );
</script>

<div>
  {#if $generatedVariableDemo && currentStepData}
    <TourguideOverlay targetId={currentStepData?.targetId} />
  {/if}
</div>
