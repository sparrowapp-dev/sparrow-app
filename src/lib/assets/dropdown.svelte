<script lang="ts">
  export let height: number = 12;
  export let width: number = 12;
  export let color: string = "grey";
</script>
 
<svg
  {width}
  {height}
  viewBox="0 0 14 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M6.29609 11.2086C6.68672 11.5992 7.32109 11.5992 7.71172 11.2086L12.7117 6.20859C13.1023 5.81797 13.1023 5.18359 12.7117 4.79297C12.3211 4.40234 11.6867 4.40234 11.2961 4.79297L7.00234 9.08672L2.70859 4.79609C2.31797 4.40547 1.68359 4.40547 1.29297 4.79609C0.902344 5.18672 0.902344 5.82109 1.29297 6.21172L6.29297 11.2117L6.29609 11.2086Z"
    fill={color}
  />
</svg>
