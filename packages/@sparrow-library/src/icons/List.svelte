<script lang="ts">
  export let size = "20px";
  export let color = "";
  $: finalColor = color === "" ? "inherit" : color;
</script>

<i
  class="icon-ic_fluent_list_20_filled"
  style="font-size:{size}; color:{finalColor}; display: flex; justify-content:center; align-items:center;"
></i>

<style>
</style>