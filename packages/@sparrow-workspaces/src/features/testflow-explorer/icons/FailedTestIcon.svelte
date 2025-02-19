<script lang="ts">
  export let width: number = 12;
  export let height: number = 12;
  export let classProp: string = "";
  export let fillColor: string = "#F37472";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 12 12"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={classProp}
>
  <path
    d="M6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0ZM6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1ZM6 8C6.41421 8 6.75 8.33579 6.75 8.75C6.75 9.16421 6.41421 9.5 6 9.5C5.58579 9.5 5.25 9.16421 5.25 8.75C5.25 8.33579 5.58579 8 6 8ZM6 2.5C6.24546 2.5 6.44961 2.67688 6.49194 2.91012L6.5 3V6.5C6.5 6.77614 6.27614 7 6 7C5.75454 7 5.55039 6.82312 5.50806 6.58988L5.5 6.5V3C5.5 2.72386 5.72386 2.5 6 2.5Z"
    fill={fillColor}
  />
</svg>
