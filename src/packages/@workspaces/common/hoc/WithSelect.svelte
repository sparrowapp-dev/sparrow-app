<script>
  import { Select } from "$lib/components/inputs";
  /**
   * unique Select component id
   */
  export let id;
  /**
   * Select data
   */
  export let data;
  /**
   * Select title id
   */
  export let titleId;
  /**
   * on change event
   */
  export let onclick;
  export let zIndex;
  export let disabled;
  $: ({ id, data, titleId, onclick, zIndex, disabled } = $$props);
</script>

<Select
  {id}
  {data}
  {titleId}
  {onclick}
  {zIndex}
  {disabled}
  borderType={"none"}
  borderActiveType={"none"}
  borderHighlight={"hover-active"}
  headerHighlight={"hover-active"}
  minBodyWidth={"150px"}
  borderRounded={true}
  headerTheme={"dark-violet"}
  bodyTheme={"violet"}
  menuItem={"v2"}
  headerFontSize={"12px"}
  isDropIconFilled={true}
/>
