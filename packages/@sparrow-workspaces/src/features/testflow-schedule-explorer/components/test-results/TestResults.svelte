<script lang="ts">
  import { Options, Modal, Button } from "@sparrow/library/ui";
  import { ArrowSortRegular } from "@sparrow/library/icons";
  import Result from "./sub-components/Result.svelte";
  import Select from "../../../../../../@sparrow-library/src/assets/select.svelte";

  export let schedule;

  let openMenuFor: string | null = null;
  let activeWrapper: HTMLElement | null = null;
  let currentPage = 1;
  let itemsPerPage = 10;
  let sortDirection: "asc" | "desc" = "desc";
  
  // Delete modal state
  let isDeleteModalOpen = false;
  let selectedResult: any = null;
  let deleteLoader = false;

  $: totalItems = schedule?.schedularRunHistory?.length || 0;
  $: totalPages = Math.ceil(totalItems / itemsPerPage);

  $: sortedHistory = schedule?.schedularRunHistory
    ? [...schedule.schedularRunHistory].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      })
    : [];

  $: paginatedHistory = sortedHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const perPageOptions = [
    { name: "5 per page", id: "5" },
    { name: "10 per page", id: "10" },
    { name: "20 per page", id: "20" },
  ];

  function handlePageSizeChange(id: string) {
    itemsPerPage = parseInt(id);
    currentPage = 1;
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  function toggleSort() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
    currentPage = 1;
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const datePart = date.toLocaleDateString("en-US", options);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${datePart} at ${hours}:${minutes} ${ampm}`;
  }

  function getRunType(flowName: string) {
    const parts = flowName.split("-");
    return parts.length > 1 ? parts[parts.length - 1].trim() : "";
  }

  function toggleMenu(e: MouseEvent, result: any, wrapper: HTMLElement) {
    e.stopPropagation();
    if (openMenuFor === result.createdAt) {
      openMenuFor = null;
      activeWrapper = null;
      selectedResult = null;
    } else {
      openMenuFor = result.createdAt;
      activeWrapper = wrapper;
      selectedResult = result; // Store the result when opening menu
      setTimeout(() => {
        const focusWrapper = document.querySelector(
          ".options-focus-wrapper",
        ) as HTMLElement;
        if (focusWrapper) {
          focusWrapper.focus();
        }
      }, 0);
    }
  }

  function closeMenu() {
    openMenuFor = null;
    activeWrapper = null;
    // Don't reset selectedResult here - keep it for the modal
  }

  function handleDeleteClick() {
    console.log("Delete clicked, selectedResult:", selectedResult);
    isDeleteModalOpen = true;
    closeMenu();
  }

  function handleDeleteCancel() {
    isDeleteModalOpen = false;
    selectedResult = null;
  }

  async function handleDeleteConfirm() {
    if (!selectedResult) return;
    
    deleteLoader = true;
    try {
      // Add your delete API call here
      // await deleteTestResult(selectedResult.createdAt);
      
      // Example: Remove from local array (replace with actual API call)
      schedule.schedularRunHistory = schedule.schedularRunHistory.filter(
        (r) => r.createdAt !== selectedResult.createdAt
      );
      
      // Adjust pagination if needed
      if (paginatedHistory.length === 1 && currentPage > 1) {
        currentPage--;
      }
      
    } catch (error) {
      console.error("Failed to delete test result:", error);
    } finally {
      deleteLoader = false;
      isDeleteModalOpen = false;
      selectedResult = null;
    }
  }
</script>

{#if schedule?.schedularRunHistory}
  <div class="content-wrapper">
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Run Time</th>
            <th on:click={toggleSort} class="sortable">
              <span class:rotated={sortDirection === "asc"}>
                <ArrowSortRegular size="20px" />
              </span>
            </th>
            <th>Status</th>
            <th>Total Requests</th>
            <th>Result</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each paginatedHistory as r}
            <Result
              {r}
              {schedule}
              {formatDate}
              {getRunType}
              {toggleMenu}
              {openMenuFor}
            />
          {/each}
        </tbody>
      </table>
    </div>

    <div class="pagination-bar">
      <span class="info">
        Showing {(currentPage - 1) * itemsPerPage + 1}–
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
      </span>

      <div class="per-page">
        <Select
          id="items-per-page"
          data={perPageOptions}
          titleId={itemsPerPage.toString()}
          onclick={handlePageSizeChange}
          menuItem="v2"
          size="small"
          isDropIconFilled={true}
          borderType="none"
          borderActiveType="none"
          headerHighlight="hover-active"
          headerTheme="transparent"
          headerFontSize="12px"
          headerHeight="28px"
          borderRounded="2px"
          bodyTheme="surface"
          minHeaderWidth="100px"
          maxHeaderWidth="160px"
          minBodyWidth="120px"
          maxBodyHeight="300px"
          zIndex={200}
          iconRequired={false}
          isHeaderCombined={false}
          showDescription={false}
        />
      </div>

      <div class="controls">
        <button on:click={() => goToPage(1)} disabled={currentPage === 1}>«</button>
        <button on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>

        {#each Array(totalPages) as _, i}
          {#if i + 1 === currentPage}
            <button class="active">{i + 1}</button>
          {:else if i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2}
            <button on:click={() => goToPage(i + 1)}>{i + 1}</button>
          {/if}
        {/each}

        <button on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
        <button on:click={() => goToPage(totalPages)} disabled={currentPage === totalPages}>»</button>
      </div>
    </div>
  </div>
{/if}

{#if openMenuFor && activeWrapper}
  <div
    tabindex="0"
    class="options-focus-wrapper"
    on:blur={closeMenu}
    on:click|stopPropagation
    style="position:absolute; left:0; top:0;"
  >
    {#key openMenuFor}
      <Options
        xAxis={activeWrapper.getBoundingClientRect().right - 104}
        yAxis={activeWrapper.getBoundingClientRect().bottom + 80 > window.innerHeight
          ? [
              activeWrapper.getBoundingClientRect().top - 50,
              activeWrapper.getBoundingClientRect().top - 14,
            ]
          : [
              activeWrapper.getBoundingClientRect().top - 12,
              activeWrapper.getBoundingClientRect().top + 24,
            ]}
        zIndex={700}
        width="104px"
        menuItems={[
          {
            onClick: handleDeleteClick,
            displayText: "Delete",
            disabled: false,
            hidden: false,
          },
        ]}
      />
    {/key}
  </div>
{/if}

<!-- Delete Confirmation Modal -->
<Modal
  title="Delete Test Result?"
  type="danger"
  width="35%"
  zIndex={1000}
  isOpen={isDeleteModalOpen}
  handleModalState={handleDeleteCancel}
>
  <div class="text-lightGray mb-1">
    <p class="text-ds-font-size-14 text-ds-line-height-130 text-ds-font-weight-medium">
      Are you sure you want to delete this test result from
      <span class="text-ds-font-weight-semi-bold" style="color: var(--text-ds-neutral-50);">
        "{selectedResult ? formatDate(selectedResult.createdAt) : ''}"
      </span>?
      This action cannot be undone.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 rounded"
    style="font-size: 16px; margin-bottom:2px;"
  >
    <Button
      disable={deleteLoader}
      title="Cancel"
      textStyleProp="font-size: var(--base-text)"
      type="secondary"
      loader={false}
      onClick={handleDeleteCancel}
    />

    <Button
      disable={deleteLoader}
      title="Delete"
      textStyleProp="font-size: var(--base-text)"
      loaderSize={18}
      type="danger"
      loader={deleteLoader}
      onClick={handleDeleteConfirm}
    />
  </div>
</Modal>

<style lang="scss">
  .content-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    min-height: 100%;
  }

  .table-container {
    flex: 1;
    width: 100%;
    overflow-x: auto;
    overflow-y: auto;
  }

  .custom-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    thead {
      color: var(--text-secondary-200);
    }
    th,
    td {
      padding: 8px 12px;
      text-align: center;
    }
    th:first-child,
    td:first-child {
      text-align: left;
    }
    .icon-col {
      width: 40px;
      text-align: center;
    }
    tr {
      border-bottom: 1px solid var(--border-ds-surface-200);
    }
  }

  .custom-table th.sortable span {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    user-select: none;
  }
  .custom-table th.sortable:hover {
    color: var(--text-primary-300);
  }
  .custom-table th.sortable span.rotated {
    transform: rotate(180deg);
  }

  .options-focus-wrapper {
    outline: none;
  }

  .pagination-bar {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-top: 1px solid var(--border-ds-surface-200);
    font-size: 12px;
    color: var(--text-secondary-200);

    position: sticky;
    bottom: 0;
    z-index: 10;

    .info {
      flex: 1;
    }

    .per-page {
      margin: 0 12px;
    }

    .controls {
      display: flex;
      gap: 4px;

      button {
        min-width: 28px;
        height: 28px;
        border: 1px solid var(--border-ds-surface-200);
        background: transparent;
        color: var(--text-secondary-200);
        border-radius: 4px;
        cursor: pointer;

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &.active {
          background: var(--accent-primary);
          color: white;
          font-weight: bold;
        }
      }
    }
  }
</style>