<script lang="ts">
  export let width: number = 4;
  export let height: number = 8;
  export let color: string = "black";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 4 8"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M4 6.22222L2 8L0 6.22222L0.7 5.58889L1.5 6.3L1.5 1.7L0.7 2.4L0 1.77778L2 0L4 1.77778L3.3 2.4L2.5 1.7L2.5 6.3L3.3 5.6L4 6.22222Z"
    fill={color}
  />
</svg>
