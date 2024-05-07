<script>
  export let wrappedComponent;
  export let id;
  export let data;
  export let titleId;
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
