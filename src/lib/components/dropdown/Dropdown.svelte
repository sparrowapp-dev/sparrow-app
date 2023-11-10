<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  let visibility = false;
  export let data: any;
  export let onclick: any;
  export let title: string;
  window.addEventListener("click", () => {
    visibility = false;
  });
</script>

<div style="position: relative; display:inline-block; z-index:999;">
  <button
    class="dropdown-btn"
    on:click={() => {
      setTimeout(() => {
        visibility = true;
      }, 100);
    }}
    >{title}
    <span class="px-2" class:dropdown-logo-active={visibility === true}
      ><img style="height:10px; width:10px;" src={dropdown} alt="" /></span
    ></button
  >
  <div
    style="display:none;"
    class="dropdown-data rounded p-2"
    class:dropdown-active={visibility === true}
  >
    {#each data as list}
      <p
        class="m-0 py-1 px-2"
        on:click={() => {
          visibility = false;
          onclick(list);
          title = list;
        }}
      >
        {list}
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
</style>
