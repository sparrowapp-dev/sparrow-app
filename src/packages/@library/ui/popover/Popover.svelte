<script lang="ts">
  import Crossicon from "$lib/assets/crossicon.svelte";
  import Modal from "../modal/Modal.svelte";
  export { handleClose };
  export let onClose;
  export let text = " ";
  export let heading = " ";
  let isExposeFeedbackForm = false;
  export let onAddFeedback;

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
        isExposeFeedbackForm = true;
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
      isOpen={isExposeFeedbackForm}
      handleModalState={(flag = false) => {
        isExposeFeedbackForm = flag;
      }}
    >
  <div class="d-flex flex-column" style="height:452.35px; margin:auto; border-radius:4.85px;" >
    <div style="height: 276px;  padding:170px;"> Video</div>
    <div class="d-flex flex-column" style="border:1px solid;">
      <div></div>
      <div></div>
      <div></div>
    </div>
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
