<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";

  let visibility = false;
  export let data: any;
  export let onclick: any;
  export let method;
  let selectedRequest: string | null = method;

  window.addEventListener("click", () => {
    visibility = false;
  });
</script>

<div
  style="position: relative; display:inline-block; z-index:9999;width:60px"
>
  <div class="d-flex align-items-center justify-content-between">
    <button
      class="dropdown-btn d-flex align-items-center justify-content-center gap-2"
      on:click={() => {
        setTimeout(() => {
          visibility = true;
        }, 100);
      }}
      ><p class="w-25 mb-0 d-flex align-items-center">{method}</p>
      <span
        class="ps-4 d-flex align-items-center"
        class:dropdown-logo-active={visibility === true}
        ><img style="height:12px; width:12px;" src={dropdown} alt="" /></span
      ></button
    >
  </div>
  <div
    style="display:none;"
    class="dropdown-data rounded ps-3 pe-5 py-2 ms-4"
    class:dropdown-active={visibility === true}
  >
    {#each data as list}
      <p
        class="m-0 d-flex py-1 gap-4"
        style="font-size: 12px;"
        class:selected-request={list === selectedRequest}
        on:click|preventDefault={() => {
          visibility = false;
          onclick(list);
          selectedRequest = list;
        }}
      >
        {list}
        {#if list === selectedRequest}
          <div class="w-100">
            <!-- <img src={checkIcon} alt="" /> -->
          </div>
        {/if}
      </p>
    {/each}
  </div>
</div>

<style>
  .dropdown-btn {
    background: none;
    outline: none;
    border: none;
  }
  .dropdown-data {
    background-color: black;
    color: white;
    position: absolute;
    top: 30px;
    left: 50%;
    min-width: 120px;
    border: 1px solid rgb(44, 44, 44);
    transform: translateX(-50%);
  }
  .dropdown-btn,
  .dropdown-data p {
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
  }
  .dropdown-data p:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .dropdown-active {
    display: block !important;
  }
  .dropdown-logo-active {
    transform: rotateX(180deg) !important;
  }
  .selected-request {
    font-weight: bold;
  }
</style>
