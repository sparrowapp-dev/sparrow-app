<script lang="ts">
  import Button from "./Button.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  let componentClass = "";
  export { componentClass as class };
  export let selectedToggleId = "";

  type ToggleButton = {
    name: string;
    id: string;
    icon: string;
  };

  export let toggleButtons: ToggleButton[];
</script>

<div class={`${componentClass} d-flex flex-row ps-3 align-self-center`}>
  {#each toggleButtons as toggleButton (toggleButton.id)}
    <span style="cursor:pointer;">
      <img
        src={toggleButton.icon}
        class="me-2 {selectedToggleId === toggleButton.id ? 'view-active' : ''}"
        style={`height: 20px; width:20px;`}
        alt="icon"
        on:click={() => {
          dispatch("click", toggleButton.id);
        }}
      />
    </span>
  {/each}
</div>

<style>
  .view-active {
    filter: invert(60%) sepia(99%) saturate(302%) hue-rotate(183deg)
      brightness(102%) contrast(105%);
  }
</style>
