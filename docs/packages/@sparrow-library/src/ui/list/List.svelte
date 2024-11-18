<script lang="ts">
  /**
   * list height
   */
  export let height = "auto";
  /**
   * handles overflow vertically
   */
  export let overflowY = "auto";
  /**
   * handles overflow horizontally
   */
  export let overflowX = "hidden";
  /**
   * additional classes
   */
  export let classProps = "";
  export let style = "";
  /**
   * binds scroll function to the parent component
   */
  export let scrollList;

  /**
   *  list container wrapper
   */
  let listContainer: HTMLElement;

  /**
   * @description - scrolls the list container to top or bottom
   * @param position - decides the direction to scroll
   */
  const scroll = (position: "bottom") => {
    if (position === "bottom") {
      listContainer.scrollTo({
        top: listContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  /**
   * @description - triggers child function from parent component
   */
  $: scrollList = (position: "bottom") => scroll(position);
</script>

<div
  bind:this={listContainer}
  class={`list-container gap-2 ${classProps}`}
  style="{style} height: {height}; overflow-y: {overflowY}; overflow-x: {overflowX}; "
>
  <div class="list-body">
    <slot />
  </div>
</div>
