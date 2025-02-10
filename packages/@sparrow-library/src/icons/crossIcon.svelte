<script>
  // You can add custom props or events if needed.
  export let height = "16px";
  export let width = "16px";
  export let color = "gray";
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {width}
  {height}
  fill={color}
  viewBox="0 0 24 24"
  role="img"
  aria-label="Cross Icon"
>
  <!-- Paste your original SVG content here -->
  <path
    d="M18 6L6 18M6 6l12 12"
    stroke-width="2"
    stroke={color}
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
