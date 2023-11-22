<script>
  export let visibilty = false;
  import plusIcon from "$lib/assets/plus.svg";
  let container;

  function onWindowClick(e) {
    if (container.contains(e.target) == false) {
      visibilty = false;
    }
  }
</script>

<svelte:window on:click={onWindowClick} />
<div
  class="d-flex align-items-center justify-content-center"
  bind:this={container}
>
  <button
    class="dropdown btn p-0 d-flex align-items-center justify-content-center"
    style="width: 32px; height:32px; background-color:#85C2FF;"
    on:click={() => {
      visibilty = !visibilty;
    }}
  >
    <!-- on:click={handleCreateCollection} -->
    <img src={plusIcon} alt="" />
    {#if visibilty}
      <div class="dropdown-content">
        <button>Collection</button>
        <button>API Requests</button>
      </div>
    {/if}
  </button>
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }
  .dropdown-content {
    position: absolute;
    top: 25px;
    right: 0px;
    background-color: #f1f1f1;
    overflow: auto;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .dropdown-content button {
    display: block;
    font-size: 12px;
    font-weight: 400;
    background-color: black;
    color: white;
    border: 1px solid rgb(44, 44, 44);
    padding: 8px;
    padding-left: 8px;
    width: 150px;
    text-align: left;
  }
  .dropdown-content > button:hover {
    background-color: #232424;
  }
</style>
