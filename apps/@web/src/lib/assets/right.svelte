<script lang="ts">
  export let width: number = 16,
    height: number = 16,
    color: string = "#313233",
    classProp: string = "";
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {width}
  {height}
  viewBox="0 0 10 16"
  fill="none"
  class={classProp}
>
  <path
    d="M8.70615 7.29365C9.09678 7.68428 9.09678 8.31865 8.70615 8.70928L3.70615 13.7093C3.31553 14.0999 2.68115 14.0999 2.29053 13.7093C1.8999 13.3187 1.8999 12.6843 2.29053 12.2937L6.58428 7.9999L2.29365 3.70615C1.90303 3.31553 1.90303 2.68115 2.29365 2.29053C2.68428 1.8999 3.31865 1.8999 3.70928 2.29053L8.70928 7.29053L8.70615 7.29365Z"
    fill={color}
  />
</svg>
