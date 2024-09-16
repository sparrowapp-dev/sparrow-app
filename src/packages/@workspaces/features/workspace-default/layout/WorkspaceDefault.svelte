<script lang="ts">
  import type { WorkspaceDocument } from "@app/database/database";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import {
    VectorIcon,
    SocketIcon,
    StackIcon,
    TreeIcon,
    CollectionIcon,
    PlusIcon,
    LibraryIcon,
  } from "@library/icons";

  import SparrowLogo from "@workspaces/features/rest-explorer/assets/images/sparrow-logo.svelte";
  import type { Observable } from "rxjs";
  import { Card } from "../components";
  import { TestflowDefault } from "@common/types/workspace/testflow";
  import { WorkspaceRole } from "$lib/utils/enums";
  export let showImportCollectionPopup;
  export let onItemCreated;
  export let isGuestUser = false;
  export let userRole;
  export let currentWorkspace: Observable<WorkspaceDocument>;
  export let handleCreateEnvironment;
  export let onCreateTestflow;

  let currentWorkspaceId: string;

  currentWorkspace.subscribe((value) => {
    currentWorkspaceId = value?._data?._id ?? "";
  });
</script>

<div class="container">
  <div class="logo">
    <SparrowLogo />
  </div>
  <div class="d-flex" style="gap: 19px;">
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <div
        class=" "
        style="height: 120px; width:130px; border: 0.5px solid var(--text-tertiary-400 );  border-radius : 4px; "
        role="button"
        on:click={() => {
          if (isGuestUser) {
            onItemCreated("collection", {
              workspaceId: currentWorkspaceId,
            });
          } else {
            showImportCollectionPopup();
          }
        }}
      >
        <div
          class="d-flex justify-content-center align-items-center"
          style="height: 79px"
        >
          <LibraryIcon
            width="24px"
            height="24px"
            color=" var( --text-primary-300)"
          />
        </div>
        <div
          class="d-flex justify-content-center align-items-center"
          style="height: 41px; background-color:var(--text-tertiary-400 ); padding:10px; font-size:14px;  "
        >
          <span><PlusIcon color={"var(--white-color)"} /></span> Collection
        </div>
      </div>
    {/if}

    <div
      class=" "
      style="height: 120px; width:130px; border: 0.5px solid var(--text-tertiary-400 );  border-radius : 4px; "
      role="button"
      on:click={() => {
        onItemCreated("request", {});
      }}
    >
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 79px"
      >
        <VectorIcon
          width="24px"
          height="24px"
          color=" var( --text-primary-300)"
        />
      </div>
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 41px; background-color:var(--text-tertiary-400 ); padding:10px; font-size:14px;  "
      >
        <span><PlusIcon color={"var(--white-color)"} /></span> Request
      </div>
    </div>
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <div
        class=" "
        style="height: 120px; width:120px; border: 0.5px solid var(--text-tertiary-400 );  border-radius : 4px; "
        role="button"
        on:click={handleCreateEnvironment}
      >
        <div
          class="d-flex justify-content-center align-items-center"
          style="height: 79px"
        >
          <StackIcon
            width="24px"
            height="24px"
            color=" var( --text-primary-300)"
          />
        </div>
        <div
          class="d-flex justify-content-center align-items-center"
          style="height: 41px; background-color:var(--text-tertiary-400 ); padding:10px; font-size:14px;  "
        >
          <span><PlusIcon color={"var(--white-color)"} /></span> Environment
        </div>
      </div>
    {/if}

    <div
      class=" "
      style="height: 120px; width:130px; border: 0.5px solid var(--text-tertiary-400 );  border-radius : 4px; "
      role="button"
      on:click={() => {
        onItemCreated("web-socket", {});
        MixpanelEvent(Events.WebSocket_Button);
      }}
    />
    <Card
      icon={TreeIcon}
      label={`${TestflowDefault.FULL_NAME}`}
      iconColor="var(--text-primary-300)"
      iconSize={"18px"}
      onClick={() => {
        onCreateTestflow();
      }}
    />
    <Card
      icon={StackIcon}
      label="Environment"
      iconColor="var(--text-primary-300)"
      iconSize={"18px"}
      onClick={handleCreateEnvironment}
    />
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 124px 325px 24px;
  }

  .logo {
    width: 175px;
    padding-bottom: 60px;
  }

  .cards {
    display: flex;
    gap: 19px;
  }
</style>
