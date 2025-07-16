<script lang="ts">
  import { starIcon, ThreeDotIcon } from "@sparrow/library/assets";
  import { UserProfileList } from "@sparrow/teams/compopnents";
  import { MenuView } from "@sparrow/common/components";
  import {
    TeamRole,
    WorkspaceMemberRole,
    WorkspaceType,
  } from "@sparrow/common/enums";
  import { Button, Options, RadioButton, Tag } from "@sparrow/library/ui";
  import {
    DeleteRegular,
    EditRegular,
    GlobeRegular,
    LockClosedRegular,
    MoreVerticalRegular,
  } from "@sparrow/library/icons";

  export let list;
  export let listIndex: number = 1;
  export let activeTeam;
  export let onOpenCollection: (id: string) => void;
  export let calculateTimeDifferenceInDays: (
    date1: Date,
    date2: Date,
  ) => string;
  export let selectedDefaultKey: string = "";
  export let onEditAuthProfile: (workspace: any) => void;
  export let onDeleteAuthProfile: (workspace: any) => void;
  export let onDefaultKeyChange: (authId: string) => void;

  export let isAdminOrOwner: boolean;
  export let openInDesktop: (workspaceID: string) => void;
  export let isWebEnvironment: boolean;

  let showMenu = false;
  let noOfColumns = 180;
  let workspaceTabWrapper: HTMLElement;

  const rightClickContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setTimeout(() => {
      showMenu = true;
    }, 100);
  };
  function closeRightClickContextMenu() {
    showMenu = false;
  }

  function formatDateToReadable(dateStr) {
    const date = new Date(dateStr);

    const day = date.getUTCDate();
    const daySuffix = getDaySuffix(day);
    const month = date.toLocaleString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();

    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${day.toString().padStart(2, "0")}${daySuffix} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  }

  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  // Handle radio button change
  const handleRadioChange = () => {
    if (onDefaultKeyChange) {
      onDefaultKeyChange(list.authId, list);
    }
  };
</script>

{#if showMenu}
  <Options
    xAxis={workspaceTabWrapper.getBoundingClientRect().right - 160}
    yAxis={[
      workspaceTabWrapper.getBoundingClientRect().top - 0,
      workspaceTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    menuItems={[
      {
        onClick: () => {
          onEditAuthProfile(list);
        },
        displayText: "Edit Auth Profile",
        disabled: false,
        icon: EditRegular,
      },
      {
        onClick: () => {
          onDeleteAuthProfile(list);
        },
        displayText: "Delete",
        disabled: list.defaultKey,
        icon: DeleteRegular,
      },
    ]}
    {noOfColumns}
  />
{/if}

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>

<tr
  tabindex="0"
  class="position-relative workspace-list-item cursor-pointer ellipsis"
  on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
>
  <td
    on:click={(e) => {
      e.stopPropagation();
      //   onOpenCollection(list._id);
    }}
    style="max-width: 10vw;"
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium rounded-start py-2 overflow-hidden ellipsis"
  >
    <div class="d-flex gap-2 align-items-center">
      {list?.name}
      {#if list?.defaultKey}
        <Tag text={"Default Key"} type={"green"} endIcon={""} size={"medium"} />
      {/if}
    </div>
  </td>

  <td
    on:click={(e) => {
      e.stopPropagation();
      onOpenCollection(list._id);
    }}
    style="max-width: 30vw;"
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2 px-2 overflow-hidden ellipsis"
  >
    {list?.description}
  </td>

  <td
    on:click={(e) => {
      e.stopPropagation();
      //   onOpenCollection(list._id);
    }}
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2 px-2"
  >
    {list?.authType}
  </td>

  <td
    on:click={(e) => {
      e.stopPropagation();
      //   onOpenCollection(list._id);
    }}
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2 px-2"
  >
    {formatDateToReadable(list.createdAt)}
  </td>

  <td
    on:click={(e) => {
      e.stopPropagation();
      //   onOpenCollection(list._id);
    }}
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2 px-2"
  >
    <div class="radio text-fs-12 d-flex align-items-center">
      <RadioButton
        id={`radio-${list.authId}`}
        name="defaultAuthProfile"
        value={list.authId}
        group={selectedDefaultKey}
        handleChange={handleRadioChange}
        labelText=""
        buttonSize="medium"
      />
    </div>
  </td>

  <td
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium rounded-end py-2"
  >
    <div
      bind:this={workspaceTabWrapper}
      class="threedot-icon-container"
      style="display: flex; justify-content: center; align-items: center;"
    >
      <Button
        type="teritiary-regular"
        onClick={(e) => {
          rightClickContextMenu(e);
        }}
        startIcon={MoreVerticalRegular}
      />
    </div>
  </td>
</tr>

<style>
  tr:hover {
    background-color: var(--bg-ds-surface-600);
    cursor: pointer;
    border-bottom-color: transparent;
  }
  tr {
    border-bottom-style: solid;
    border-bottom-color: var(--bg-ds-surface-600);
    border-bottom-width: 1px;
  }
  tr:active {
    background-color: var(--bg-ds-surface-700);
    cursor: pointer;
  }
  tr[tabindex="0"]:focus-visible {
    outline: solid 2px var(--bg-ds-primary-300) !important;
    outline-offset: -2px;
    background-color: var(--bg-ds-surface-700);
    border-radius: 8px;
  }

  .workspace-list-item td {
    background-color: transparent;
  }
  .threedot-icon-container {
    visibility: visible;
    pointer-events: none;
    transition:
      visibility 0.3s ease,
      opacity 0.3s ease;
  }

  tr:hover .threedot-icon-container {
    visibility: visible;
    pointer-events: auto;
  }

  .tab-data {
    vertical-align: middle;
    padding-top: 10px;
  }
  .open-desktop-btn {
    /* position: absolute; */
    /* top: 50%; */
    /* right: 30px; */
    /* transform: translateY(-50%); */
    font-size: 12px;
    background-color: var(--color-primary);
    color: #3670f7;
    padding: 5px 10px;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.3s ease,
      visibility 0.3s;
  }
  tr:hover .open-desktop-btn {
    visibility: visible;
    opacity: 1;
  }
  .open-desktop-btn:hover {
    background-color: var(--color-primary-dark);
  }
  tr {
    border-radius: 8px;
  }

  .radio {
    margin: 0.5rem;
    outline: none;
    position: relative;
  }
  .radio input[type="radio"] {
    position: absolute;
    opacity: 0;
  }
  .radio input[type="radio"] + .radio-label:before {
    content: "";
    background: var(--text-secondary-150);
    border-radius: 100%;
    border: 2px solid var(--bg-primary-400);
    display: inline-block;
    width: 14px;
    height: 14px;
    position: relative;
    top: 3px;
    margin-right: 0.5em;
    cursor: pointer;
    text-align: center;
    transition: all 250ms ease;
  }
  .radio input[type="radio"]:checked + .radio-label:before {
    background-color: var(--bg-primary-400);
    border-width: 1.5px;
    border-color: var(--text-secondary-150);
  }
  .radio input[type="radio"]:checked + .radio-label:after {
    content: "";
    position: absolute;
    top: 7.5px;
    left: 4.5px;
    height: 5px;
    width: 5px;
    border-radius: 100%;
    background-color: var(--text-secondary-150);
    z-index: 100;
  }
  .radio input[type="radio"]:focus + .radio-label:before {
    outline: none;
    /* border-color: #3197ee; */
  }
  .radio input[type="radio"] + .radio-label:empty:before {
    margin-right: 0;
  }
</style>
