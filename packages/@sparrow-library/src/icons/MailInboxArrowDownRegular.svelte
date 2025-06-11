<script lang="ts">
  export let size = "20px";
  export let color = "";
  $: finalColor = color === "" ? "inherit" : color;
</script>

<i
  class="icon-ic_fluent_mail_inbox_arrow_down_20_regular"
  style="font-size:{size}; color:{finalColor}; display: flex; justify-content:center; align-items:center;"
></i>

<style>
</style>
