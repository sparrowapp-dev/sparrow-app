<script lang="ts">
  export let width: number = 10;
  export let height: number = 2;
  export let classProp: string = "";
  export let fillColor: string = "#D8D8D9";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 10 2"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={classProp}
>
  <path
    d="M2 1C2 1.55229 1.55228 2 1 2C0.447715 2 0 1.55229 0 1C0 0.447715 0.447715 0 1 0C1.55228 0 2 0.447715 2 1ZM6 1C6 1.55229 5.55229 2 5 2C4.44772 2 4 1.55229 4 1C4 0.447715 4.44772 0 5 0C5.55229 0 6 0.447715 6 1ZM9 2C9.55229 2 10 1.55229 10 1C10 0.447715 9.55229 0 9 0C8.44771 0 8 0.447715 8 1C8 1.55229 8.44771 2 9 2Z"
    fill={fillColor}
  />
</svg>
