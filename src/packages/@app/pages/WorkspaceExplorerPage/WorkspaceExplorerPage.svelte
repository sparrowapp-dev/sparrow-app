<script lang="ts">
  import Input from "@library/forms/Input/Input.svelte";
  import Information from "@library/icons/Information.svelte";
  import Button from "@library/ui/button/Button.svelte";
  import { SettingIcon } from "@library/icons";
  import { notifications } from "@library/ui/toast/Toast";
  import Tooltip from "@library/ui/tooltip/Tooltip.svelte";
  import { onMount } from "svelte";
  import { WorkspaceSetting } from "@workspaces/features";
  export let modifiedUser;
  export let onUpdateWorkspaceName;
  export let collectionList;
  export let onUpdateWorkspaceDesc;
  export let tab;

  let showAbout = true;
  let showWorkspaceSettings = false;
  let workspaceName = tab.name;
  let collectionLength = 0;
  let workspaceDescription = tab.description;

  $: {
    if (collectionList) {
      collectionList.subscribe((value) => {
        collectionLength = value.length;
      });
    }
  }

  const saveValue = () => {
    onUpdateWorkspaceDesc(workspaceDescription);
  };

  const toggleSection = (section: string) => {
    showAbout = section === "about";
    showWorkspaceSettings = section === "workspaceSetting";
  };

  const getvalue = () => {
    if (workspaceName != "") {
      onUpdateWorkspaceName(workspaceName);
    } else {
      notifications.error("Please Enter A Workspace Name");
    }
  };
</script>

<div class="d-flex" style="width: 100%;">
  <div
    style="border-right:2px solid #000000; width: calc(100% - 280px);  padding:24px;"
  >
    {#if showAbout}
      <div
        class="About d-flex flex-column"
        style="padding:24px; gap:16px !important; height:100dvh;"
      >
        <div class="d-flex" style="justify-content: space-between;">
          <div
            class="ellipsis"
            style="font-weight: 700; font-size:18px; color:var(--text-secondary-100);"
          >
            <Input
              bind:value={workspaceName}
              on:blur={getvalue}
              id={"workspace-name"}
              width={"300px"}
              type="text"
              defaultBorderColor="Transparent"
              hoveredBorderColor={"var(--border-primary-300)"}
              focusedBorderColor={"var(--border-primary-300)"}
              class="text-fs-18 bg-transparent  "
              style="outline:none; font-weight:700;"
              placeholder="My Workspace"
            />
          </div>
          <Tooltip title={"Coming Soon"} placement={"bottom"} distance={10}>
            <Button
              type={"primary"}
              title={"Invite"}
              textClassProp={"fs-12"}
              textStyleProp={"font-weight:400; font-size:12px;"}
              disable={"true"}
            ></Button>
          </Tooltip>
        </div>

        <div>
          <textarea
            bind:value={workspaceDescription}
            on:blur={saveValue}
            class="text-area w-100"
            style="height: 121px; background-color:transparent; border:none;"
            placeholder="This is your personal workspace. Describe the objectives of the workspace and how it is meant to be used. Or create a comprehensive API documentation by including links to your collections and requests. Start typing. "
          ></textarea>
        </div>
      </div>
    {/if}
    {#if showWorkspaceSettings}
      <WorkspaceSetting {modifiedUser} />
    {/if}
  </div>

  <div
    class="d-flex flex-column"
    style=" width:280px; padding: 24px 16px 24px 16px ;"
  >
    <div
      class="d-flex flex-column gap-1"
      style="color: var(--text-secondary-100);"
    >
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        on:click={() => toggleSection("about")}
        class="side-bar-btn d-flex gap-2"
        style="height:32px; padding:5px; padding-left:12px; border-radius:4px; font-size:12px; font-weight:700; background-color: {showAbout
          ? 'var(--bg-tertiary-300)'
          : 'transparent'};"
      >
        <div>
          <Information
            height={"13.33px"}
            width={"13.33px"}
            color={"var(--icon-secondary-200)"}
          />
        </div>
        <div class="active" style="padding-top:0.5px;">About</div>
      </div>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        on:click={() => toggleSection("workspaceSetting")}
        class="side-bar-btn d-flex gap-1"
        style="padding:5px; padding-left:9px; border-radius:4px; font-size:12px; font-weight:700; background-color: {showWorkspaceSettings
          ? 'var(--bg-tertiary-300)'
          : 'transparent'} "
      >
        <div>
          <SettingIcon
            height={"21px"}
            width={"21px"}
            color={"var(--icon-secondary-200)"}
          />
        </div>
        <div class="" style="padding-top: 2px;">Workspace Settings</div>
      </div>
    </div>
    <div
      style="border-bottom:1px solid #2A2C3C; margin-top:16px; margin-bottom:8px;"
    ></div>
    <div class="d-flex flex-column" style="gap: 8px; height:430px;">
      <div
        class="ps-0"
        style="color: var( --text-secondary-200); font-weight:700; font-size:12px; padding:8px; "
      >
        WORKSPACE UPDATES
      </div>
      <div class="d-flex flex-column">
        <div
          style="color: var(--text-secondary-100); font-weight:700; font-size:12px;"
        >
          Last Activity by -
        </div>
        <div
          class="d-flex"
          style="color: var( --text-secondary-200); font-weight:700; font-size:12px; justify-content:space-between"
        >
          <p>{modifiedUser?.name}</p>
        </div>
      </div>
    </div>
    <div class="d-flex gap-1" style=" ">
      <span style="color: var(--text-primary-300) ;">{collectionLength}</span
      ><span
        style="color: var(--text-secondary-300); font-size:12px; font-weight:700; margin-top:5px !important;"
        >COLLECTIONS</span
      >
    </div>
  </div>
</div>

<style>
  .text-area::placeholder {
    font-size: 12px;
    color: var(--bg-secondary-950);
  }
  .text-area {
    outline: none;
  }
  .side-bar-btn:hover {
    background-color: var(--bg-tertiary-600) !important;
  }

  .search-area {
    color: var(--text-secondary-200);
    outline: none;
    font-size: 12px;
    padding-left: 12px;
    padding-top: 7px;
  }
  .ellipsis {
    color: var(--text-secondary-100) !important ;
  }
</style>
