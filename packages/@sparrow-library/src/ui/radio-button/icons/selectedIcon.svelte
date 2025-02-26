<script lang="ts">
<<<<<<< HEAD
  export let width: number = 16;
  export let height: number = 16;
  export let selectedColor: string = "#6894F9";
</script>

<svg
  {width}
  {height}
  viewBox="0 0 12 12"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M6 9C7.65685 9 9 7.65685 9 6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9ZM6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0ZM1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6Z"
    fill={selectedColor}
  />
</svg>
=======
  export let size = "16px";
  export let selectedColor: string = "#6894F9";
  export let classProp: string = "";
</script>

<i
  class="icon-ic_fluent_radio_button_20_filled {classProp} select-icon"
  style="font-size:{size}; color:{selectedColor}; display: flex; justify-content:center; align-items:center;"
></i>

<style>
  .select-icon {
    cursor: pointer;
  }
</style>
>>>>>>> b362302354c8c8c39d740c18cc4c308d7568ae29
