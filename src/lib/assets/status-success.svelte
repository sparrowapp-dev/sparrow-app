<script lang="ts">
  export let width: number = 24,
    height: number = 24,
    backgroundColor: string = "green",
    textColor: string = "black";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 6 6"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect
    class="status-success"
    width="6"
    height="6"
    rx="3"
    fill={backgroundColor}
  />
  <g clip-path="url(#clip0_8245_119186)">
    <path
      d="M4.67715 1.82324C4.7748 1.9209 4.7748 2.07949 4.67715 2.17715L2.67715 4.17715C2.57949 4.2748 2.4209 4.2748 2.32324 4.17715L1.32324 3.17715C1.22559 3.07949 1.22559 2.9209 1.32324 2.82324C1.4209 2.72559 1.57949 2.72559 1.67715 2.82324L2.50059 3.6459L4.32402 1.82324C4.42168 1.72559 4.58027 1.72559 4.67793 1.82324H4.67715Z"
      fill={textColor}
    />
  </g>
  <defs>
    <clipPath id="clip0_8245_119186">
      <rect width="3.5" height="4" fill="white" transform="translate(1.25 1)" />
    </clipPath>
  </defs>
</svg>
