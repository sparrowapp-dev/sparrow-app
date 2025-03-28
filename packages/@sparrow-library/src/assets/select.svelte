<script lang="ts">
  export let width: number = 24,
    height: number = 24,
    classProp: string = "",
    color: string = "#3670F7",
    selectedColor: string = "#3670F7",
    selected: boolean = false;
</script>

{#if selected}
  <!-- Replaced existing SVG with Shape.svg content -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    {width}
    {height}
    viewBox="0 0 80 80"
    fill="none"
    class={`${classProp} select-icon`}
  >
    <circle
      cx="40"
      cy="40"
      r="35"
      stroke={color}
      stroke-width="6"
      fill="none"
    />
    <circle cx="40" cy="40" r="20" fill={color} />
  </svg>
{:else}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    {width}
    {height}
    viewBox="0 0 16 16"
    fill="none"
    class={`${classProp} select-icon`}
  >
    <g clip-path="url(#clip0_7331_14638)">
      <path
        d="M14.5 8C14.5 6.27609 13.8152 4.62279 12.5962 3.40381C11.3772 2.18482 9.72391 1.5 8 1.5C6.27609 1.5 4.62279 2.18482 3.40381 3.40381C2.18482 4.62279 1.5 6.27609 1.5 8C1.5 9.72391 2.18482 11.3772 3.40381 12.5962C4.62279 13.8152 6.27609 14.5 8 14.5C9.72391 14.5 11.3772 13.8152 12.5962 12.5962C13.8152 11.3772 14.5 9.72391 14.5 8ZM0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8Z"
        fill={selectedColor}
      />
    </g>
    <defs>
      <clipPath id="clip0_7331_14638">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
{/if}

<style>
  .select-icon {
    padding: 3px;
  }
</style>
