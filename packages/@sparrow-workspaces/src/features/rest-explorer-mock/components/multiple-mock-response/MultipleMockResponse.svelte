<script lang="ts">
  import { Tooltip } from "@sparrow/library/ui";
  import { Options } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import {
    MoreHorizontalRegular,
    CircleSmallFilled,
    CircleSmallRegular,
    AddRegular,
  } from "@sparrow/library/icons";
  import { Toggle } from "@sparrow/library/ui";
  import { getMethodStyle } from "@sparrow/common/utils";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Modal } from "@sparrow/library/ui";

  export let tab;
  export let userRole;
  export let isWebApp;

  export let mockResponses;
  export let onCreateMockResponse;
  export let onHandleMockResponseState;
  export let onRenameMockResponse;

  let inputField: HTMLInputElement;
  let responseTabElements: HTMLElement[] = [];
  let activeResponseIdx: number = null;
  let showMenu: boolean = false;
  let newResponseName: string = "";
  let noOfColumns = 180;
  let isRenaming = false;
  let deleteLoader: boolean = false;
  let isDeletePopup: boolean = false;
  let responseToDelete = null;

  const handleRenameInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    newResponseName = target.value.trim();
  };

  const onRenameBlur = async () => {
    if (newResponseName && activeResponseIdx !== null) {
      const response = mockResponses[activeResponseIdx];
      await onRenameMockResponse(response.id, newResponseName);
      isRenaming = false;
      newResponseName = "";
    } else {
      isRenaming = false;
      newResponseName = "";
    }
  };

  const onRenameInputKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldFile",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  function handleSelectClick(e: MouseEvent) {
    if (!showMenu) return;

    // Get the currently active response element
    const activeEl = responseTabElements[activeResponseIdx];
    if (activeEl && !activeEl.contains(e.target as Node)) {
      showMenu = false;
      activeResponseIdx = null;
    }
  }

  function rightClickContextMenu(e: Event, idx) {
    setTimeout(() => {
      showMenu = !showMenu;
      activeResponseIdx = idx;
    }, 100);
  }
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

{#if showMenu && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
  <Options
    xAxis={responseTabElements[activeResponseIdx].getBoundingClientRect()
      .right - 30}
    yAxis={[
      responseTabElements[activeResponseIdx].getBoundingClientRect().top - 0,
      responseTabElements[activeResponseIdx].getBoundingClientRect().bottom + 5,
    ]}
    zIndex={500}
    menuItems={[
      {
        onClick: () => {},
        displayText: "Open Mock Response",
        disabled: false,
      },
      {
        onClick: () => {
          isRenaming = true;
          newResponseName = mockResponses[activeResponseIdx].name;
          setTimeout(() => inputField && inputField.focus(), 100);
          showMenu = false;
        },
        displayText: "Rename Mock Response",
        disabled: false,
      },
      {
        onClick: () => {
          responseToDelete = mockResponses[activeResponseIdx];
          isDeletePopup = true;
          showMenu = false;
        },
        displayText: "Delete",
        disabled: false,
      },
    ]}
    {noOfColumns}
  />
{/if}
<div
  tabindex="0"
  class="d-flex align-items-center justify-content-between"
  style={`height:32px; padding-left:3px; gap:8px; margin-bottom: 4px;`}
>
  <button
    tabindex="-1"
    on:click|preventDefault={() => {}}
    class=" d-flex align-items-center position-relative bg-transparent border-0"
  >
    <div
      class="api-method text-{getMethodStyle(
        $tab.property.mockRequest?.method,
      )}"
    >
      {$tab.property.mockRequest?.method?.toUpperCase() === "DELETE"
        ? "DEL"
        : $tab.property.mockRequest?.method?.toUpperCase()}
    </div>
    <div class="api-name ellipsis" style="color:var(--bg-ds-neutral-50)">
      <p
        class="ellipsis m-0 p-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
      >
        {$tab?.name}
      </p>
    </div>
  </button>
  <Tooltip
    title={"Add Mock Response"}
    placement={"top-center"}
    distance={10}
    show={true}
    zIndex={701}
  >
    <span class="add-icon-container">
      <Button
        size="extra-small"
        customWidth={"24px"}
        type="teritiary-regular"
        onClick={onCreateMockResponse}
        startIcon={AddRegular}
      />
    </span>
  </Tooltip>
</div>
{#if mockResponses.length === 0}
  <div
    class="d-flex text-ds-font-size-12 text-ds-font-weight-regular justify-content-center text-center"
    style="color: var(--text-neutral-400); padding: 8px;"
  >
    No mock responses configured for<br /> this request.
  </div>
{:else}
  <div
    class="d-flex text-ds-font-size-12 text-ds-font-weight-regular"
    style="color: var(--text-neutral-400); padding-left: 8px; padding-bottom: 8px;"
  >
    {mockResponses.length} Response{mockResponses.length === 1 ? "" : "s"}
  </div>
  <div
    class="sparrow-thin-scrollbar"
    style=" {isWebApp
      ? 'max-height: 70%;'
      : 'max-height: 75%;'} overflow-y: auto; overflow-x: hidden;"
  >
    {#each mockResponses as response, idx (response.id)}
      <div
        tabindex="0"
        bind:this={responseTabElements[idx]}
        class="d-flex align-items-center justify-content-between my-button btn-primary"
        style={`height:32px; padding-left:3px; gap:4px; margin-bottom: 8px;"`}
      >
        <button
          tabindex="-1"
          on:contextmenu|preventDefault={(e) => rightClickContextMenu(e, idx)}
          on:click|preventDefault={() => {}}
          class="main-file d-flex align-items-center position-relative bg-transparent border-0"
        >
          <Tooltip
            title={"This response is inactive."}
            show={!response.isMockResponseActive}
            placement={"top-center"}
          >
            <span style="display: flex; margin-right:4px;">
              {#if response.isMockResponseActive}
                <CircleSmallFilled color="var( --icon-ds-success-400)" />
              {:else}
                <CircleSmallRegular />
              {/if}
            </span>
          </Tooltip>
          <div
            class="api-method"
            style="font-size: 9px; color: {response?.statusCode >= 200 &&
            response?.statusCode < 400
              ? 'var(--text-ds-danger-300)'
              : response.statusCode
                ? 'var(--text-ds-success-300)'
                : 'var(--text-ds-neutral-50)'};"
          >
            {response?.statusCode ? response.statusCode : "-"}
          </div>

          {#if isRenaming && activeResponseIdx === idx}
            <input
              class="py-0 renameInputFieldFile text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
              style=" width: calc(100% - 50px);"
              id="renameInputFieldFile"
              type="text"
              maxlength={100}
              value={response.name}
              on:click|stopPropagation={() => {}}
              bind:this={inputField}
              on:input={handleRenameInput}
              on:blur={onRenameBlur}
              on:keydown={onRenameInputKeyPress}
            />
          {:else}
            <div
              class="api-name ellipsis"
              style="color: var(--bg-ds-neutral-50);"
            >
              <p
                class="ellipsis m-0 p-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
              >
                {response.name}
              </p>
            </div>
          {/if}
        </button>
        {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
          <Toggle
            bind:isMockResponseActive={response.isMockResponseActive}
            label=""
            fontSize="12px"
            textColor="var(--text-ds-neutral-200)"
            fontWeight="400"
            onChange={() => {
              onHandleMockResponseState(
                response.id,
                !response.isMockResponseActive,
              );
            }}
          />
        {/if}

        {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
          <div style="position: relative; display: flex; align-items: center;">
            <Tooltip
              title={"More"}
              show={!showMenu}
              placement={"bottom-center"}
            >
              <span class="threedot-icon-container d-flex">
                <Button
                  tabindex={-1}
                  id={`${response.id}`}
                  size="extra-small"
                  customWidth={"24px"}
                  type="teritiary-regular"
                  startIcon={MoreHorizontalRegular}
                  onClick={(e) => {
                    rightClickContextMenu(e, idx);
                  }}
                />
              </span>
            </Tooltip>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<Modal
  title={"Delete Mock Response?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div
    class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium"
  >
    <p>
      Are you sure you want to delete this Mock Response?
      <span
        class="text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);"
      >
        "{responseToDelete?.name}"
      </span>
      will be removed and cannot be restored.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
  >
    <Button
      disable={deleteLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"secondary"}
      loader={false}
      onClick={() => {
        isDeletePopup = false;
        responseToDelete = null;
      }}
    />

    <Button
      disable={deleteLoader}
      title={"Delete"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"danger"}
      loader={deleteLoader}
      onClick={() => {
        deleteLoader = true;
        //on delete mock response functioncall
        deleteLoader = false;
        isDeletePopup = false;
      }}
    />
  </div>
</Modal>

<style>
  .add-icon-container {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .api-method {
    font-size: 9px;
    font-weight: 500;
    width: 24px !important;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .api-name {
    height: 24px;
    line-height: 18px;
    font-weight: 500;
    width: calc(100% - 18px);
    text-align: left;
    display: flex;
    align-items: center;

    padding: 2px 4px;
    caret-color: var(--bg-ds-primary-300);
  }
  .api-name:focus {
    border: 1px solid var(--bg-ds-primary-300) !important;
  }
  .my-button:hover .threedot-icon-container {
    visibility: visible;
  }

  .threedot-icon-container {
    visibility: hidden;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
  }

  .btn-primary {
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding-right: 5px;
    border-radius: 2px;
  }
  .btn-primary:hover {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
  }
  .btn-primary:hover .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:active {
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
  }
  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:focus-visible {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--bg-ds-primary-300);
    outline: none;
  }
  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }
  .navbar {
    width: 180px;
    height: auto;
    overflow: hidden;
  }

  .renameInputFieldFile {
    height: 24px;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding: 4px 2px;
    outline: none;
    border-radius: 4px !important;
    border: 1px solid var(--bg-ds-primary-300);
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldFile:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .main-file {
    width: 100%;
  }
</style>
