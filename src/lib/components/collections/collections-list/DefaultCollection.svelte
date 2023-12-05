<script lang="ts">
  import whitePlus from "$lib/assets/plus-white.svg";
</script>

<div
  class="container-fluid row d-flex flex-column align-items-center ps-4 pe-3 pt-3"
>
  <p
    style="font-size: 14px;
font-weight: 300;"
  >
    Add Collections to your Workspace to group your requests or send an API
    request directly
  </p>
  <div class="d-flex flex-column gap-3 w-100 mt-3 align-items-center">
    <button
      class="buttons d-flex justify-content-center align-items-center gap-1"
    >
      <img src={whitePlus} alt="+" />Collection
    </button>
    <button class="buttons">
      <img src={whitePlus} alt="+" />
      API Request</button
    >
  </div>
</div>

<style>
  .buttons {
    width: 180px;
    height: 32px;
    padding: 4px, 12px, 4px, 4px;
    border-radius: 4px;
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    border: none;
  }
</style>
