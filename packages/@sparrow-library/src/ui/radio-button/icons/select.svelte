<script lang="ts">
  import SelectedIcon from "../icons/selectedIcon.svelte";
  import UnSelectedIcon from "../icons/unSelectedIcon.svelte";
  export let size = "16px";
  export let classProp: string = "";
  export let selectedColor = "#6894F9";
  export let unSelectedColor = "#B6B7B9";
  export let selected: boolean = false;
</script>

{#if selected}
  <SelectedIcon {size} {selectedColor} {classProp} />
{:else}
  <UnSelectedIcon {size} {unSelectedColor} {classProp} />
{/if}
