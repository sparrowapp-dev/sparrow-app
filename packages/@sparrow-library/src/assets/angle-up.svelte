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
  <g clip-path="url(#clip0_2369_18124)">
    <path
      d="M7.53073 5.5293C7.79115 5.26888 8.21406 5.26888 8.47448 5.5293L11.8078 8.86263C12.0682 9.12305 12.0682 9.54596 11.8078 9.80638C11.5474 10.0668 11.1245 10.0668 10.8641 9.80638L8.00156 6.94388L5.13906 9.8043C4.87865 10.0647 4.45573 10.0647 4.19531 9.8043C3.9349 9.54388 3.9349 9.12096 4.19531 8.86055L7.52865 5.52721L7.53073 5.5293Z"
      fill={color}
    />
  </g>
  <defs>
    <clipPath id="clip0_2369_18124">
      <rect
        width="9.33333"
        height="10.6667"
        fill="white"
        transform="translate(3.3335 2.66699)"
      />
    </clipPath>
  </defs>
</svg>
