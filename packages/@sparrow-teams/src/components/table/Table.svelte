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
  export let onSortToggle = (field: string) => {};

  import { ArrowSortRegular } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";

  const handleSortClick = (field: string) => {
    onSortToggle(field);
  };
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
            class="{headerContentClassProp} tab-head text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-semi-bold"
          >
            <div
              style="display: flex; gap: 4px; align-items: center; padding:8px;max-height:30px"
            >
              {heading}
              {#if heading.toLowerCase() === "last updated"}
                <Button
                  startIcon={ArrowSortRegular}
                  size={"small"}
                  type={"teritiary-regular"}
                  onClick={() => handleSortClick("updatedAt")}
                />
              {/if}
            </div>
          </th>
        {/if}
      {/each}
    </tr>
  </thead>
  <slot />
</table>

<style>
  .tab-head {
    padding: 8px 8px 8px 0px;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    color: var(--text-ds-neutral-400);
    background-color: transparent;
    z-index: 999 !important;
    text-align: center;
  }
  thead {
    border-bottom: 0px solid var(--bg-ds-surface-900);
  }
</style>
