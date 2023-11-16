<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  let visibility = false;
  export let data: any;
  export let onclick: any;
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
    >Workspace
    <span class="px-2" class:dropdown-logo-active={visibility === true}
      ><img style="height:10px; width:10px;" src={dropdown} alt="" /></span
    ></button
  >
  <div
    style="display:none;"
    class="dropdown-data rounded px-2"
    class:dropdown-active={visibility === true}
  >
    <p
      style="color: var(--send-button);"
      class="d-flex align-items-center justify-content-between m-0 px-2"
      on:click={() => {
        visibility = false;
      }}
    >
      <span>Create New Workspace</span><span>+</span>
    </p>
    <hr class="m-0 p-0" />
    {#if $data}
      {#each $data as list, index}
        {#if index < 5}
          <p
            class="d-flex align-items-center m-0 px-2"
            on:click={() => {
              visibility = false;
              onclick(list._id, list.name);
            }}
          >
            {list.name}
          </p>
        {/if}
      {/each}
    {/if}
    <hr class="m-0 p-0" />
    <p
      style="color: var(--request-arc)"
      class="d-flex align-items-center m-0 px-2"
      on:click={() => {
        visibility = false;
      }}
    >
      View All Workspaces
    </p>
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
    top: 45px;
    left: 0;
    min-width: 200px;
    border: 1px solid rgb(44, 44, 44);
  }
  .dropdown-btn,
  .dropdown-data p {
    font-size: 12px;
    font-weight: 400;
    height: 26px;
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
