<script lang="ts">
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
    ChevronLeftRegular,
    ChevronRightRegular,
  } from "@sparrow/library/icons";
  import { Dropdown } from "@sparrow/library/icons";

  // Props
  export let currentPage: number = 1;
  export let itemsPerPage: number = 10;
  export let totalItems: number = 0;
  export let onPageChange: (page: number) => void = () => {};
  export let onItemsPerPageChange: (itemsPerPage: number) => void = () => {};
  export let showItemCount: boolean = true;
  export let containerWidth: string = "100%";
  export let itemsPerPageOptions: number[] = [10, 20, 30, 40, 50];

  // Calculate total pages
  $: totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);

  // Calculate displayed range
  $: startItem = (currentPage - 1) * itemsPerPage + 1;
  $: endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Navigate to page within bounds
  const navigateToPage = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    if (validPage !== currentPage) {
      onPageChange(validPage);
    }
  };

  // Navigation handlers
  const goToFirstPage = () => navigateToPage(1);
  const goToPreviousPage = () => navigateToPage(currentPage - 1);
  const goToNextPage = () => navigateToPage(currentPage + 1);
  const goToLastPage = () => navigateToPage(totalPages);

  // Button disabled states
  $: isFirstPage = currentPage === 1;
  $: isLastPage = currentPage === totalPages;

  // Handle items per page change
  const handleItemsPerPageChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newItemsPerPage = parseInt(target.value);
    onItemsPerPageChange(newItemsPerPage);
    // Reset to first page when items per page changes
    navigateToPage(1);
  };
</script>

<div
  class="pagination-container d-flex justify-content-between align-items-center"
  style="width: {containerWidth};"
>
  <!-- Left Side: Item Count and Items Per Page Selector -->
  <div class="d-flex align-items-center gap-3">
    {#if showItemCount}
      <div class="pagination-text">
        Showing {startItem}-{endItem} of {totalItems}
      </div>
    {/if}

    <div class="items-per-page-wrapper">
      <select
        class="items-per-page-select"
        value={itemsPerPage}
        on:change={handleItemsPerPageChange}
        aria-label="Items per page"
      >
        {#each itemsPerPageOptions as option}
          <option value={option}>{option} per page</option>
        {/each}
      </select>
      <span class="dropdown-icon-wrapper">
        <Dropdown />
      </span>
    </div>
  </div>

  <!-- Right Side: Navigation Buttons -->
  <div class="pagination-controls d-flex align-items-center gap-1">
    <button
      on:click={goToFirstPage}
      class="pagination-btn"
      disabled={isFirstPage}
      aria-label="First page"
      title="First page"
    >
      <ChevronDoubleLeftRegular
        color={isFirstPage
          ? "var(--bg-ds-neutral-500)"
          : "var(--bg-ds-neutral-100)"}
      />
    </button>

    <button
      on:click={goToPreviousPage}
      class="pagination-btn"
      disabled={isFirstPage}
      aria-label="Previous page"
      title="Previous page"
    >
      <ChevronLeftRegular
        color={isFirstPage
          ? "var(--bg-ds-neutral-500)"
          : "var(--bg-ds-neutral-100)"}
      />
    </button>

    <button
      on:click={goToNextPage}
      class="pagination-btn"
      disabled={isLastPage}
      aria-label="Next page"
      title="Next page"
    >
      <ChevronRightRegular
        color={isLastPage
          ? "var(--bg-ds-neutral-500)"
          : "var(--bg-ds-neutral-100)"}
      />
    </button>

    <button
      on:click={goToLastPage}
      class="pagination-btn"
      disabled={isLastPage}
      aria-label="Last page"
      title="Last page"
    >
      <ChevronDoubleRightRegular
        color={isLastPage
          ? "var(--bg-ds-neutral-500)"
          : "var(--bg-ds-neutral-100)"}
      />
    </button>
  </div>
</div>

<style>
  .pagination-container {
    padding: 12px 16px;
    background-color: transparent;
  }

  .pagination-text {
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: var(--text-secondary-200, #666);
    white-space: nowrap;
  }

  .items-per-page-wrapper {
    display: flex;
    align-items: center;
    position: relative;
  }

  .items-per-page-select {
    padding: 6px 32px 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-ds-neutral-100, #333);
    background-color: var(--bg-ds-surface-800, #fff);
    border: 1px solid var(--border-color, #ddd);
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
    appearance: none;
  }

  .dropdown-icon-wrapper {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .items-per-page-select:hover {
    border-color: var(--bg-ds-neutral-400, #999);
  }

  .items-per-page-select:focus {
    border-color: var(--bg-ds-primary-500, #007bff);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }

  .pagination-controls {
    display: flex;
    gap: 4px;
  }

  .pagination-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 8px;
    background-color: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
  }

  .pagination-btn:hover:not(:disabled) {
    background-color: var(--bg-ds-surface-700, #f5f5f5);
  }

  .pagination-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .pagination-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .pagination-btn:focus-visible {
    outline: 2px solid var(--bg-ds-primary-500, #007bff);
    outline-offset: 2px;
  }
</style>
