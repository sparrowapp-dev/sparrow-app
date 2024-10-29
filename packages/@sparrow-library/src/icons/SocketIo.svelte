<script>
  export let height = "24px";
  export let width = "24px";
  export let color = "grey";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 13 13"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle cx="6.5" cy="6.5" r="5.8" stroke={color} stroke-width="1.4" />
  <path
    d="M6.5 4.0625L4.0625 6.5H5.8175L6.5 4.0625Z"
    stroke={color}
    stroke-width="0.9"
  />
  <path
    d="M6.5 8.9375L8.9375 6.5H7.1825L6.5 8.9375Z"
    stroke={color}
    stroke-width="0.9"
  />
</svg>
