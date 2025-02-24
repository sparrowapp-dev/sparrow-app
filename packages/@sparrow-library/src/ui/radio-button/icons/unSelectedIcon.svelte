<script lang="ts">
  export let width: number = 16;
  export let height: number = 16;
  export let classProp: string = "";
  export let unSelectedColor: string = "#B6B7B9";
</script>

<svg
  {width}
  {height}
  fill="none"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  class="{classProp} select-icon"
  ><path
    d="M12 22.002c5.524 0 10.002-4.478 10.002-10.001 0-5.524-4.478-10.002-10.002-10.002-5.524 0-10.002 4.478-10.002 10.002 0 5.523 4.478 10.001 10.002 10.001Zm0-1.5A8.501 8.501 0 1 1 12 3.5a8.501 8.501 0 0 1 0 17.003Z"
    fill={unSelectedColor}
  /></svg
>

<style>
  .select-icon {
    cursor: pointer;
  }
</style>
