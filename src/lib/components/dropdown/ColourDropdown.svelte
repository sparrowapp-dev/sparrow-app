<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";

  let visibility : boolean = false;
  export let data: Array<{
    name : string,
    id : string,
    color: string
  }>;
  export let onclick: (tab: string) => void;
  export let method : string;
  let selectedRequest: {
    name : string,
    id : string,
    color: string
  };

  window.addEventListener("click", () => {
    visibility = false;
  });

  $: {
    if (method) {
      data.forEach((element) => {
        if (element.id === method) {
          selectedRequest = element;
        }
      });
    }
  }
</script>

<div class="parent-dropdown display-inline-block" style=" position: relative;  z-index:9999;"
>
  <div on:click={() => {
    setTimeout(() => {
      visibility = true;
    }, 100);
  }}
  >
  <div
  class="dropdown-btn rounded px-3 d-flex align-items-center justify-content-between"
  class:dropdown-btn-active={visibility === true}
      ><p
        class=" mb-0 text-{selectedRequest?.color}"
      >
        {selectedRequest?.name}
      </p>
      <span
        class:dropdown-logo-active={visibility === true}
        ><img style="height:12px; width:12px;" src={dropdown} alt="" /></span
      ></div>
  </div>
  <div
    class="d-none dropdown-data p-1 rounded"
    class:dropdown-active={visibility === true}
  >
    {#each data as list}
      <div
        class="d-flex px-2 py-1 justify-content-between highlight"
        on:click={() => {
          visibility = false;
          onclick(list.id);
        }}
      >
        <p
          class="m-0 p-0 text-{list.color}"
          style="font-size: 12px;"
          class:selected-request={list.id === selectedRequest.id}
        >
          {list.name}
        </p>
        {#if selectedRequest.id === list.id}
          <img src={checkIcon} alt="" />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .dropdown-btn {
    background: none;
    outline: none;
    border: none;
    height: 34px;
    width: 110px;
  }
  .dropdown-btn:hover{
    background-color: var(--border-color);
  }
  .dropdown-data {
    background-color: black;
    color: white;
    position: absolute;
    top: 40px;
    left: 0;
    min-width: 120px;
    border: 1px solid rgb(44, 44, 44);
  }
  .dropdown-btn p,
  .dropdown-data p {
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
  }
  .dropdown-active {
    display: block !important;
  }
  .dropdown-logo-active {
    transform: rotateX(180deg) !important;
  }
  .highlight {
    border-radius: 4px;
  }
  .highlight:hover {
    background-color: #232424;
  }
  .dropdown-btn{
    border: 1px solid #313233;
    cursor: pointer;
  }
  .dropdown-btn-active{
    border: 1px solid #85C2FF;
  }
</style>
