<script lang="ts">
  export let width: number = 16;
  export let height: number = 16;
  export let classProp: string = "";
  export let unSelectedColor: string = "#B6B7B9";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 12 12"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="{classProp} select-icon"
>
  <path
    d="M6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1ZM0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6Z"
    fill={unSelectedColor}
  />
</svg>

<style>
  .select-icon {
    padding: 3px;
    cursor: pointer;
  }
</style>
