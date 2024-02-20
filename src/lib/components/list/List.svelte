<script lang="ts">
  export let height = "100%";
  export let overflowY = "scroll";
  export let overflowX = "auto";
  export let classProps = "";
</script>

<div
  class={`list-container gap-2 sparrow-thin-scrollbar ${classProps}`}
  style={`max-height: ${height}; overflow-y=${overflowY}; overflow-x: ${overflowX};`}
>
  <div class="list-body">
    <slot />
  </div>
</div>
