<script lang="ts">
  export let width: number = 16;
  export let height: number = 16;
  export let classProp: string = "";
  export let unSelectedColor: string = "#B6B7B9";
</script>

{#if width === 16 && height === 16}
  <svg
    {width}
    {height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="{classProp} select-icon"
  >
    <path
      d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z"
      fill={unSelectedColor}
    />
  </svg>
{:else}
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
{/if}

<style>
  .select-icon {
    cursor: pointer;
  }
</style>
