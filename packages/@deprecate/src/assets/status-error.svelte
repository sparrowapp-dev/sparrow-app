<script lang="ts">
  export let width: number = 24,
    height: number = 24,
    backgroundColor: string = "red",
    textColor: string = "black";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 6 6"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect width="6" height="6" rx="3" fill={backgroundColor} />
  <g clip-path="url(#clip0_8245_119183)">
    <path
      d="M4.17666 2.17654C4.27432 2.07888 4.27432 1.92029 4.17666 1.82263C4.079 1.72498 3.92041 1.72498 3.82275 1.82263L3.0001 2.64607L2.17666 1.82341C2.079 1.72576 1.92041 1.72576 1.82275 1.82341C1.7251 1.92107 1.7251 2.07966 1.82275 2.17732L2.64619 2.99998L1.82354 3.82341C1.72588 3.92107 1.72588 4.07966 1.82354 4.17732C1.92119 4.27498 2.07979 4.27498 2.17744 4.17732L3.0001 3.35388L3.82354 4.17654C3.92119 4.27419 4.07979 4.27419 4.17744 4.17654C4.2751 4.07888 4.2751 3.92029 4.17744 3.82263L3.354 2.99998L4.17666 2.17654Z"
      fill={textColor}
    />
  </g>
  <defs>
    <clipPath id="clip0_8245_119183">
      <rect width="3" height="4" fill="white" transform="translate(1.5 1)" />
    </clipPath>
  </defs>
</svg>
