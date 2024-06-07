<script lang="ts">
  export let width: number = 16,
    height: number = 16,
    classProp: string = "",
    color: string = "white";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={classProp}
>
  <g clip-path="url(#clip0_2401_2212)">
    <path
      d="M12.4726 4.86182C12.733 5.12223 12.733 5.54515 12.4726 5.80557L7.13923 11.1389C6.87881 11.3993 6.45589 11.3993 6.19548 11.1389L3.52881 8.47223C3.26839 8.21182 3.26839 7.7889 3.52881 7.52848C3.78923 7.26807 4.21214 7.26807 4.47256 7.52848L6.66839 9.72223L11.5309 4.86182C11.7913 4.6014 12.2142 4.6014 12.4746 4.86182H12.4726Z"
      fill={color}
    />
  </g>
  <defs>
    <clipPath id="clip0_2401_2212">
      <rect
        width="9.33333"
        height="10.6667"
        fill={color}
        transform="translate(3.3335 2.6665)"
      />
    </clipPath>
  </defs>
</svg>
