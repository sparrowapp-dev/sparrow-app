<script lang="ts">
  export let width: number = 12,
    height: number = 12,
    color: string = "#8A9299",
    classProp: string = "";
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {width}
  {height}
  class={classProp}
  viewBox="0 0 12 12"
  fill="none"
>
  <g clip-path="url(#clip0_7953_11284)">
    <path
      d="M8.2231 1.06873L7.21476 2.07706L9.9231 4.78539L10.9314 3.77706C11.4523 3.25623 11.4523 2.41248 10.9314 1.89164L10.1106 1.06873C9.58976 0.547892 8.74601 0.547892 8.22518 1.06873H8.2231ZM6.74393 2.54789L1.88768 7.40623C1.67101 7.62289 1.51268 7.89164 1.42518 8.18539L0.687681 10.6916C0.635598 10.8687 0.683514 11.0583 0.812681 11.1875C0.941848 11.3166 1.13143 11.3646 1.30643 11.3146L3.81268 10.5771C4.10643 10.4896 4.37518 10.3312 4.59185 10.1146L9.45226 5.25623L6.74393 2.54789Z"
      fill={color}
    />
  </g>
  <defs>
    <clipPath id="clip0_7953_11284">
      <rect
        width="10.6667"
        height="10.6667"
        fill="white"
        transform="translate(0.666748 0.666626)"
      />
    </clipPath>
  </defs>
</svg>
