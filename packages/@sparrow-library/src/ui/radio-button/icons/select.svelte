<script lang="ts">
  import SelectedIcon from "../icons/selectedIcon.svelte";
  import UnSelectedIcon from "../icons/unSelectedIcon.svelte";
<<<<<<< HEAD

  export let width: number = 16;
  export let height: number = 16;
=======
  export let size = "16px";
>>>>>>> b362302354c8c8c39d740c18cc4c308d7568ae29
  export let classProp: string = "";
  export let selectedColor = "#6894F9";
  export let unSelectedColor = "#B6B7B9";
  export let selected: boolean = false;
</script>

{#if selected}
<<<<<<< HEAD
  <SelectedIcon {width} {height} {selectedColor} />
{:else}
  <UnSelectedIcon {width} {height} {unSelectedColor} {classProp} />
=======
  <SelectedIcon {size} {selectedColor} {classProp} />
{:else}
  <UnSelectedIcon {size} {unSelectedColor} {classProp} />
>>>>>>> b362302354c8c8c39d740c18cc4c308d7568ae29
{/if}
