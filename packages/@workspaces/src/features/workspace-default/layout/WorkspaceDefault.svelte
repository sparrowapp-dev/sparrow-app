<script lang="ts">
  import type { WorkspaceDocument } from "@app/database/database";
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import {
    VectorIcon,
    SocketIcon,
    StackIcon,
    TreeIcon,
    CollectionIcon,
  } from "@sparrow/library/icons";

  import SparrowLogo from "../../rest-explorer/assets/images/sparrow-logo.svelte";
  import type { Observable } from "rxjs";
  import { Card } from "../components";
  import { TFDefaultEnum } from "@sparrow/common/types/workspace/testflow";
  import { WorkspaceRole } from "@deprecate/utils/enums";

  export let showImportCollectionPopup;
  export let onItemCreated;
  export let isGuestUser = false;
  export let currentWorkspace: Observable<WorkspaceDocument>;
  export let handleCreateEnvironment;
  export let onCreateTestflow;
  export let userRole;

  let currentWorkspaceId: string;

  currentWorkspace.subscribe((value) => {
    currentWorkspaceId = value?._data?._id ?? "";
  });
</script>

<div class="container">
  <div class="logo">
    <SparrowLogo />
  </div>
  <div class="cards">
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <Card
        icon={CollectionIcon}
        label="Collection"
        iconColor="var(--text-primary-300)"
        iconSize={"18px"}
        onClick={() => {
          if (isGuestUser) {
            onItemCreated("collection", {
              workspaceId: currentWorkspaceId,
            });
          } else {
            showImportCollectionPopup();
          }
        }}
      />
    {/if}
    <Card
      icon={VectorIcon}
      label="REST API"
      iconColor="var(--text-primary-300)"
      iconSize={"18px"}
      onClick={() => {
        onItemCreated("request", {});
      }}
    />
    <Card
      icon={SocketIcon}
      label="WebSocket"
      iconColor="var(--text-primary-300)"
      iconSize={"18px"}
      onClick={() => {
        onItemCreated("web-socket", {});
        MixpanelEvent(Events.WebSocket_Button);
      }}
    />
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <Card
        icon={TreeIcon}
        label={`${TFDefaultEnum.FULL_NAME}`}
        iconColor="var(--text-primary-300)"
        iconSize={"18px"}
        onClick={() => {
          onCreateTestflow();
          MixpanelEvent(Events.Default_Screen_TestFlows);
        }}
      />
    {/if}
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <Card
        icon={StackIcon}
        label="Environment"
        iconColor="var(--text-primary-300)"
        iconSize={"18px"}
        onClick={handleCreateEnvironment}
      />
    {/if}
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
