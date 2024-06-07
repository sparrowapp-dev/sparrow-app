<script lang="ts">
  import Crossicon from "$lib/assets/crossicon.svelte";
  import { Route, Router } from "svelte-navigator";
  import Ellipse from "@library/icons/Ellipse.svelte";
  import Modal from "../modal/Modal.svelte";
  import Step1 from "./Step1.svelte";
  import Step2 from "./Step2.svelte";
  import { writable } from "svelte/store";
  import Step3 from "./Step3.svelte";
    import Header from "./Header.svelte";
  export { handleClose };
  export let onClose;
  export let text = " ";
  export let heading = " ";
  let isGuidePopup = false;

  const currentStep = writable(1);
  function nextStep() {
    currentStep.update(n => (n < 3 ? n + 1 : n));
  }

  function previousStep() {
    currentStep.update(n => (n > 1 ? n - 1 : n));
  }

  function handleClose() {
    onClose();
  }
</script>

<div
  class="container d-flex flex-column"
  style="position:relative; background-color:#1C1D2B; border-radius:4px; "
>
  <button
    class="cross-btn b-0 border-0"
    style="position:absolute; right:10px; top:2px; background-color:transparent "
    on:click={handleClose}
  >
    <Crossicon />
  </button>
  <div class="heading">{heading}</div>
  <p class="description">
    {text}
    <span
      on:click={() => {
        isGuidePopup = true;
      }}
      class="link btn p-0 border-0"
      style="font-size: 12px;">See how it works.</span
    >
  </p>
  <div style="position: relative;">
    <Modal
      title={""}
      type={"dark"}
      width={"474px"}
      zIndex={10000}
      isOpen={isGuidePopup}
      handleModalState={(flag = false) => {
        isGuidePopup = flag;
      }}
    >
    <div>
      <Header {nextStep} {previousStep} />
      {#if $currentStep === 1}
        <Step1 />
      {:else if $currentStep === 2}
        <Step2 />
      {:else if $currentStep === 3}
        <Step3 />
      {/if}
    </div>
  </Modal>
  </div>
</div>

<style>
  .container {
    margin-bottom: 10px;
  }
  .heading {
    padding-top: 10px;
    padding-left: 10px;
    font-weight: 700;
  }
  .description {
    padding-top: 5px;
    padding-left: 10px;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
  }
  .link {
    color: #3670f7;
    text-decoration: underline;
  }
</style>
