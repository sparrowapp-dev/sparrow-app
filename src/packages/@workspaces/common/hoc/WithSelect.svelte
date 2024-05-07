<script>
  /**
   * hoc component
   */
  export let wrappedComponent;
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
  $: ({ wrappedComponent, id, data, titleId, onclick } = $$props);
</script>

<svelte:component
  this={wrappedComponent}
  {id}
  {data}
  {titleId}
  {onclick}
  headerTheme={"grey"}
  borderType={"none"}
  borderActiveType={"none"}
  borderHighlight={"hover-active"}
  headerHighlight={"hover-active"}
  minBodyWidth={"150px"}
  borderRounded={true}
  bodyTheme={"grey"}
  zIndex={499}
  checkIconColor={"var(--text-primary-200)"}
  menuItem={"v2"}
/>
