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

  export let placeholder;

  $: ({ id, data, titleId, onclick, zIndex, disabled, placeholder } = $$props);
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
  minBodyWidth={"100px"}
  variant={"secondary"}
  menuItem={"v2"}
  minHeaderWidth={"100px"}
  size={"medium"}
  placeholderText={placeholder}
/>
