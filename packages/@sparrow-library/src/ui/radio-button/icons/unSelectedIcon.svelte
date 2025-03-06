<script lang="ts">
  export let size = "16px";
  export let unSelectedColor: string = "#6894F9";
  export let classProp: string = "";
</script>

<i
  class="icon-ic_fluent_radio_button_20_regular {classProp} select-icon"
  style="font-size:{size}; color:{unSelectedColor}; display: flex; justify-content:center; align-items:center;"
></i>

<style>
  .select-icon {
    cursor: pointer;
  }
</style>
