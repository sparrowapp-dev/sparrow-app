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
  headerHighlight={"hover"}
  minHeaderWidth={"200px"}
  borderActiveType={"none"}
  headerTheme={"violet"}
  zIndex={1000}
  bodyTheme={"violet"}
/>
