<script lang="ts">
  import { Avatar } from "@sparrow/library/ui";
  import { onMount } from "svelte";

  /**
   * List of updates of a workspace
   */
  export let workspaceUpdatesList;

  /**
   * Function to be called on end of scroll
   */
  export let onWorkspaceUpdateScroll;

  /**
   * Indicate whether workspace is shared or not.
   */
  export let isSharedWorkspace = false;

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
    scrollableContainer?.addEventListener("scroll", handleScroll);
    return () => {
      scrollableContainer?.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<div
  style="border-bottom:1px solid #2A2C3C; margin-top:16px; margin-bottom:8px;"
></div>
<div style="flex:1; overflow:auto;">
  {#if !isSharedWorkspace}
    <div
      class="ps-0 text-ds-font-size-12 text-ds-font-weight-semi-bold"
      style="color: var( --text-secondary-200); padding:8px; "
    >
      Workspace Updates
    </div>
    <div style="flex:1; overflow:auto;" bind:this={scrollableContainer}>
      <div class="h-100">
        {#if workspaceUpdatesList && workspaceUpdatesList[0]?.updates}
          {#each workspaceUpdatesList[0].updates as update}
            <div class="d-flex">
              <div class="me-2">
                <Avatar
                  letter={update.detailsUpdatedBy.split("")[0][0]}
                  size="extra-small"
                  type="letter"
                  bgColor="background-color: var(--bg-ds-surface-600);"
                />
              </div>
              <div
                class="text-ds-font-size-12 text-ds-font-weight-medium"
                style="color: var(--text-secondary-100); "
              >
                {update.message}
                <div
                  class="d-flex mt-1 text-ds-font-size-12 text-ds-font-weight-regular"
                  style="color: var( --text-secondary-200); justify-content:space-between"
                >
                  <p>{timeAgo(update.createdAt)}</p>
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>
