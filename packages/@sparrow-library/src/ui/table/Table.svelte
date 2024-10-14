<script lang="ts">
  export let tableClassProps = "";
  export let tableStyleProp = "";
  export let dataSearch = "true";
  export let tableHeaderClassProp = "";
  export let tableHeaderStyleProp = "";
  export let tableRowClassProp = "";
  export let headerObject = [""];
  export let contributorsCount = 0;
  export let headingDataSortable = "false";
  export let headerContentClassProp = "";
</script>

<table
  class={`${tableClassProps}`}
  style={`${tableStyleProp}`}
  data-search={`${dataSearch}`}
>
  <thead class={`${tableHeaderClassProp}`} style={`${tableHeaderStyleProp}`}>
    <tr class={`${tableRowClassProp}`}>
      {#each headerObject as heading}
        {#if heading !== "Contributors" || (heading === "Contributors" && contributorsCount > 1)}
          <th
            data-sortable={headingDataSortable}
            class={`${headerContentClassProp} tab-head`}>{heading}</th
          >
        {/if}
      {/each}
    </tr>
  </thead>
  <slot />
</table>

<style>
  .tab-head {
    padding: 8px;
    font-size: var(--small-text);
    font-weight: 700;
    line-height: var(--medium-text);
    color: var(--sparrow-text-color);
    background-color: var(--bg-secondary-850);
    z-index: 999 !important;
  }
</style>
