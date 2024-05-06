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
  borderType={"none"}
  borderRounded={true}
  menuItem={"v2"}
  borderHighlight={"active"}
  headerHighlight={"hover-active"}
  minHeaderWidth={"200px"}
  borderActiveType={"none"}
  headerTheme={"dark-violet"}
  zIndex={499}
  bodyTheme={"violet"}
/>
