<script>
  import { Select } from "@sparrow/library/forms";
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
  /**
   * sets opacity for overlapping containers
   */
  export let zIndex;
  /**
   * identifies Select disabled or not
   */
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
  headerHeight={"28px"}
  minBodyWidth={"104px"}
  borderRounded={"4px"}
  headerTheme={"secondary"}
  bodyTheme={"surface"}
  menuItem={"v2"}
  headerFontSize={"12px"}
  isDropIconFilled={true}
  headerFontWeight={600}
/>
