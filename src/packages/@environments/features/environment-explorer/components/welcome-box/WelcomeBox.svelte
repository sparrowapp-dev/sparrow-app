<script lang="ts">
  import Crossicon from "$lib/assets/crossicon.svelte";
  export { handleClose };
  export let onClose;
  export let text = " ";

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
  <div class="heading">Welcome to Environments!</div>
  <p class="description">
   {text} <span class="link"
      >See how it works.</span
    >
  </p>
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
