<script lang="ts">
  export let height = "16px";
  export let width = "16px";
  export let color = "var(--text-secondary-200)";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M8 16L4 12L8 8"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M16 8L20 12L16 16"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M12.8 6L11.2 18"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>
