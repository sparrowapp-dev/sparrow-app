<script lang="ts">
  export let height = "";
  export let width = "";
  export let color = "url(#gradientFill)";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 20 21"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Define Gradient -->
  <defs>
    <linearGradient id="gradientFill" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#11ADF0" />
      <stop offset="50%" stop-color="#316CF6" />
      <stop offset="100%" stop-color="#6147FF" />
    </linearGradient>
  </defs>

  <!-- SVG Paths -->
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M6.05134 10.0243L7.40179 5.73905H8.2305L9.58095 10.0243L13.6323 11.4528V12.3294L9.58095 13.7578L8.2305 18.0431H7.40179L6.05134 13.7578L2 12.3294V11.4528L6.05134 10.0243Z"
    fill={color === "gradient" ? "url(#gradientFill)" : color}
  />

  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M13.6948 4.24942L14.3901 2.04309H15.2188L15.9141 4.24942L18 4.98486V5.86143L15.9141 6.59688L15.2188 8.8032H14.3901L13.6948 6.59688L11.609 5.86143V4.98486L13.6948 4.24942Z"
    fill={color === "gradient" ? "url(#gradientFill)" : color}
  />
</svg>
