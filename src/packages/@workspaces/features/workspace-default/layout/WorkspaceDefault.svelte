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
  } from "@library/icons";

  import SparrowLogo from "@workspaces/features/rest-explorer/assets/images/sparrow-logo.svelte";
  import type { Observable } from "rxjs";
  import { Card } from "../components";
  import { TFDefaultEnum } from "@common/types/workspace/testflow";

  export let showImportCollectionPopup;
  export let onItemCreated;
  export let isGuestUser = false;
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
  <div class="cards">
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
    <Card
      icon={VectorIcon}
      label="Request"
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
