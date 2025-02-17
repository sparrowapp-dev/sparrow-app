<script lang="ts">
  import SelectedIcon from "../icons/selectedIcon.svelte";
  import UnSelectedIcon from "../icons/unSelectedIcon.svelte";

  export let width: number = 16;
  export let height: number = 16;
  export let classProp: string = "";
  export let selectedColor = "#6894F9";
  export let unSelectedColor = "#B6B7B9";
  export let selected: boolean = false;
</script>

{#if selected}
  <SelectedIcon {width} {height} {selectedColor} />
{:else}
  <UnSelectedIcon {width} {height} {unSelectedColor} {classProp} />
{/if}
