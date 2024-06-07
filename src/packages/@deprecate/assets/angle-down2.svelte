<script lang="ts">
  export let width: number = 24,
    height: number = 24,
    color: string = "red";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <g clip-path="url(#clip0_2369_29943)">
    <path
      d="M7.53073 10.1394C7.79115 10.3998 8.21406 10.3998 8.47448 10.1394L11.8078 6.80605C12.0682 6.54564 12.0682 6.12272 11.8078 5.8623C11.5474 5.60189 11.1245 5.60189 10.8641 5.8623L8.00156 8.7248L5.13906 5.86439C4.87865 5.60397 4.45573 5.60397 4.19531 5.86439C3.9349 6.1248 3.9349 6.54772 4.19531 6.80814L7.52865 10.1415L7.53073 10.1394Z"
      fill={color}
    />
  </g>
  <defs>
    <clipPath id="clip0_2369_29943">
      <rect
        width="9.33333"
        height="10.6667"
        fill="white"
        transform="translate(3.33337 2.66699)"
      />
    </clipPath>
  </defs>
</svg>
