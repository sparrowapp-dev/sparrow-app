<script>
  import { SparkleFilled } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { onMount, onDestroy } from "svelte";
  import SparkleRotating from "../../../generate-variables/components/SparkleRotating.svelte";

  export let onSaveApplyVariableFlow = () => {
    console.log("Default saveFlow function called");
  };
  export let onCancelApplyVariableFlow = () => {
    console.log("Default onCancelApplyVariableFlow function called");
  };
  export let collectionName = "";
  export let totalAiGeneratedVariablesCount = 0;
  export let applyingAiGeneratedVariablesCount = 0;

  let timeoutId;
  let showCancel = true; // Controls Cancel button visibility

  onMount(() => {
    const delay = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000; // random between 3000–5000 ms

    timeoutId = setTimeout(() => {
      showCancel = false; // Hide Cancel button
      onSaveApplyVariableFlow();
    }, delay);
  });

  function handleCancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    showCancel = false; // Hide Cancel button immediately
    onCancelApplyVariableFlow();
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<p class="text-center" style="height: 50px;">
  <SparkleRotating />
</p>
<p class="text-fs-20 text-center" style="font-weight: 600;">
  {applyingAiGeneratedVariablesCount}/{totalAiGeneratedVariablesCount} Applying Your
  Variables
</p>
<p class="text-fs-14 text-center">
  Applying variables to your "{collectionName}" collection. If you cancel now,
  all changes applied by Sparrow during this task will be reverted, including
  those already completed.
</p>
<div class="text-center d-flex justify-content-center">
  {#if showCancel}
    <Button title="Cancel" onClick={handleCancel} type={"danger"} />
  {/if}
</div>
