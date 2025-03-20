<script lang="ts">
  export let size = "";
  export let color = "";
  $: finalColor = color === "" ? "inherit" : color;
</script>

<i
  class="icon-ic_fluent_chevron_left_20_regular"
  style="font-size:{size}; color:{finalColor}; display: flex; justify-content:center; align-items:center;"
></i>

<style>
</style>
