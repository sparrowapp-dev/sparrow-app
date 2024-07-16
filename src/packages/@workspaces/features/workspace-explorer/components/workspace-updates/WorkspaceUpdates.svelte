<script lang="ts">
  import { onMount } from "svelte";

  /**
   * List of updates of a workspace
   */
  export let workspaceUpdatesList;

  /**
   * Function to be called on end of scroll
   */
  export let onWorkspaceUpdateScroll;

  // Reference to the scrollable container
  let scrollableContainer: HTMLDivElement;

  /**
   * Converts a date string into a human-readable "time ago" format relative to the current date and time.
   *
   * This function calculates the time difference between the given date and the current date/time,
   * and returns a string indicating how long ago the date occurred.
   *
   * @param dateString - The date string to convert into a "time ago" format. Should be in a format parsable by Date constructor.
   * @returns A string representing how long ago the date occurred (e.g., "3 days ago", "1 hour ago", "just now").
   *
   */
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 1) {
      return `${days} days ago`;
    } else if (days === 1) {
      return "1 day ago";
    } else if (hours > 1) {
      return `${hours} hours ago`;
    } else if (hours === 1) {
      return "1 hour ago";
    } else if (minutes > 1) {
      return `${minutes} minutes ago`;
    } else if (minutes === 1) {
      return "1 minute ago";
    } else {
      return "just now";
    }
  };

  // Function to load more updates
  const loadMoreUpdates = async () => {
    onWorkspaceUpdateScroll();
    // Add your logic to fetch more updates here
  };

  // Event handler for scrolling
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMoreUpdates();
    }
  };

  onMount(() => {
    scrollableContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollableContainer.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<div
  style="border-bottom:1px solid #2A2C3C; margin-top:16px; margin-bottom:8px;"
></div>
<div class="d-flex flex-column" style=" flex-grow:1 !important;">
  <div
    class="ps-0"
    style="color: var( --text-secondary-200); font-weight:700; font-size:12px; padding:8px; "
  >
    WORKSPACE UPDATES
  </div>
  <div style="overflow: auto; flex:1" bind:this={scrollableContainer}>
    <div style="height:430px; flex-grow:1 !important; gap: 8px;">
      {#if workspaceUpdatesList && workspaceUpdatesList[0]?.updates}
        {#each workspaceUpdatesList[0].updates as update}
          <div class="d-flex flex-column">
            <div
              style="color: var(--text-secondary-100); font-weight:500; font-size:12px;"
            >
              {update.message}
            </div>
            <div
              class="d-flex mt-1"
              style="color: var( --text-secondary-200); font-weight:400; font-size:12px; justify-content:space-between"
            >
              <p>{update.detailsUpdatedBy}</p>
              <p>{timeAgo(update.createdAt)}</p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
