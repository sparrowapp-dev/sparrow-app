<script lang="ts">
  /**
   * list height
   */
  export let height = "100%";
  /**
   * handles overflow vertically
   */
  export let overflowY = "scroll";
  /**
   * handles overflow horizontally
   */
  export let overflowX = "hidden";
  /**
   * additional classes
   */
  export let classProps = "";
</script>

<div
  class={`list-container gap-2 sparrow-thin-scrollbar ${classProps}`}
  style={`height: ${height}; overflow-y: ${overflowY}; overflow-x: ${overflowX};`}
>
  <div class="list-body">
    <slot />
  </div>
</div>
