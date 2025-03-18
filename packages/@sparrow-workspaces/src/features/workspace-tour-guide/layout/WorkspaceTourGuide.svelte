<script>
  import DefaultTourGuide from "../components/default-tour-guide/DefaultTourGuide.svelte";
  import { defaultTourGuideContent, totalSteps } from "../utils";
  import {
    defaultCurrentStep,
    isDefaultTourGuideClose,
    isDefaultTourGuideOpen,
  } from "../../../stores";
  $: currentStepData = defaultTourGuideContent.find(
    (step) => step.stepCount === $defaultCurrentStep,
  );
</script>

<div>
  {#if $isDefaultTourGuideClose}
    <DefaultTourGuide
      targetId="question-container"
      TitleName="Quick Help!"
      DescriptionContent="Access documentation and stay up to date with the latest features and improvements."
      TotalsCards={totalSteps}
      additionLeftValue={-210}
      tipPosition="bottom-center"
      rightButtonName="Close"
      onNext={() => {
        isDefaultTourGuideClose.set(false);
        isDefaultTourGuideOpen.set(false);
      }}
    />
  {/if}

  {#if $isDefaultTourGuideOpen && currentStepData}
    <DefaultTourGuide
      targetId={currentStepData.targetId}
      TitleName={currentStepData.Title}
      DescriptionContent={currentStepData.description}
      additionLeftValue={currentStepData.additionLeftvalue || 0}
      CardNumber={$defaultCurrentStep}
      TotalsCards={totalSteps}
      tipPosition={currentStepData.tipPosition}
      rightButtonName={$defaultCurrentStep === totalSteps ? "Finish" : ""}
      onNext={() => {
        defaultCurrentStep.set($defaultCurrentStep + 1);
      }}
      onClose={() => {
        isDefaultTourGuideOpen.set(false);
      }}
    />
  {/if}
</div>
