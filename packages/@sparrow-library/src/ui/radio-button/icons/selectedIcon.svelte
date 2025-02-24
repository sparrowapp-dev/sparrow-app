<script lang="ts">
  export let width: number = 16;
  export let height: number = 16;
  export let selectedColor: string = "#6894F9";
  export let classProp: string = "";
</script>

<svg
  {width}
  {height}
  fill="none"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  ><path
    d="M12 1.999c5.524 0 10.002 4.478 10.002 10.002 0 5.523-4.478 10.001-10.002 10.001-5.524 0-10.002-4.478-10.002-10.001C1.998 6.477 6.476 1.999 12 1.999Zm0 1.5a8.502 8.502 0 1 0 0 17.003A8.502 8.502 0 0 0 12 3.5Zm-.003 2.5a5.998 5.998 0 1 1 0 11.996 5.998 5.998 0 0 1 0-11.996Z"
    fill={selectedColor}
    class="{classProp}  select-icon"
  /></svg
>

<style>
  .select-icon {
    cursor: pointer;
  }
</style>
