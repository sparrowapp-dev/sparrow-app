<script lang="ts">
  import Button from "./Button.svelte";

  let componentClass = "";
  export { componentClass as class };

  type ToggleButton = {
    name: string;
    id: string;
    icon: string;
    isSelected: boolean;
  };

  export let toggleButtons: ToggleButton[];
</script>

<div class={`${componentClass} d-flex flex-row ps-3 align-self-center`}>
  {#each toggleButtons as toggleButton (toggleButton.id)}
    <span style="cursor:pointer;">
      <Button
        type="icon"
        title={toggleButton.name}
        buttonStartIcon={toggleButton.icon}
        buttonClassProp={toggleButton.isSelected ? "view-active" : ""}
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
