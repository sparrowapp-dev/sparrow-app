<script lang="ts">
  export let color: string = "#8A9299",
    width: number = 12,
    height: number = 12,
    classProp: string = "",
    locked: boolean = false,
    lockedColor: string = "#1193F0",
    lockedWidth: number = 10,
    lockedHeight: number = 12;
</script>

{#if locked}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={lockedWidth}
    height={lockedHeight}
    viewBox="0 0 10 12"
    fill="none"
  >
    <g clip-path="url(#clip0_7307_16021)">
      <path
        d="M3.33325 3.66669V4.66669H6.66658V3.66669C6.66658 2.74585 5.92075 2.00002 4.99992 2.00002C4.07909 2.00002 3.33325 2.74585 3.33325 3.66669ZM1.99992 4.66669V3.66669C1.99992 2.01044 3.34367 0.666687 4.99992 0.666687C6.65617 0.666687 7.99992 2.01044 7.99992 3.66669V4.66669H8.33325C9.06867 4.66669 9.66658 5.2646 9.66658 6.00002V10C9.66658 10.7354 9.06867 11.3334 8.33325 11.3334H1.66659C0.931169 11.3334 0.333252 10.7354 0.333252 10V6.00002C0.333252 5.2646 0.931169 4.66669 1.66659 4.66669H1.99992Z"
        fill={lockedColor}
      />
    </g>
    <defs>
      <clipPath id="clip0_7307_16021">
        <rect
          width="9.33333"
          height="10.6667"
          fill="white"
          transform="translate(0.333252 0.666687)"
        />
      </clipPath>
    </defs>
  </svg>
{:else}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    {width}
    {height}
    class={classProp}
    viewBox="0 0 12 12"
    fill="none"
  >
    <g clip-path="url(#clip0_7307_16017)">
      <path
        d="M7.33333 3.66669C7.33333 2.74585 8.07917 2.00002 9 2.00002C9.92083 2.00002 10.6667 2.74585 10.6667 3.66669V4.66669C10.6667 5.03544 10.9646 5.33335 11.3333 5.33335C11.7021 5.33335 12 5.03544 12 4.66669V3.66669C12 2.01044 10.6562 0.666687 9 0.666687C7.34375 0.666687 6 2.01044 6 3.66669V4.66669H1.33333C0.597917 4.66669 0 5.2646 0 6.00002V10C0 10.7354 0.597917 11.3334 1.33333 11.3334H8C8.73542 11.3334 9.33333 10.7354 9.33333 10V6.00002C9.33333 5.2646 8.73542 4.66669 8 4.66669H7.33333V3.66669Z"
        fill={color}
      />
    </g>
    <defs>
      <clipPath id="clip0_7307_16017">
        <rect
          width="12"
          height="10.6667"
          fill="white"
          transform="translate(0 0.666687)"
        />
      </clipPath>
    </defs>
  </svg>
{/if}
