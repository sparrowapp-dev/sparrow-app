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
    d="M1.2937 7.29365C0.903076 7.68428 0.903076 8.31865 1.2937 8.70928L6.2937 13.7093C6.68433 14.0999 7.3187 14.0999 7.70933 13.7093C8.09995 13.3187 8.09995 12.6843 7.70933 12.2937L3.41558 7.9999L7.7062 3.70615C8.09683 3.31553 8.09683 2.68115 7.7062 2.29053C7.31558 1.8999 6.6812 1.8999 6.29058 2.29053L1.29058 7.29053L1.2937 7.29365Z"
    fill={color}
  />
</svg>
