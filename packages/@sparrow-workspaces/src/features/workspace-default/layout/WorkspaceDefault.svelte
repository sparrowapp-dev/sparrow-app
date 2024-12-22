<script lang="ts">
  import type { WorkspaceDocument } from "@app/database/database";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import {
    VectorIcon,
    SocketIcon,
    StackIcon,
    TreeIcon,
    CollectionIcon,
    SocketIoIcon,
    GraphIcon,
  } from "@sparrow/library/icons";

  import SparrowLogo from "../../rest-explorer/assets/images/sparrow-logo.svelte";
  import type { Observable } from "rxjs";
  import { Card } from "../components";
  import { TFDefaultEnum } from "@sparrow/common/types/workspace/testflow";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";

  export let showImportCollectionPopup;
  export let onItemCreated;
  export let isGuestUser = false;
  export let currentWorkspace: Observable<WorkspaceDocument>;
  export let handleCreateEnvironment;
  export let onCreateTestflow;
  export let userRole;
  export let isExpandCollection;
  export let isWebApp = false;

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
          isExpandCollection = true;
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
      iconSize={"20px"}
      onClick={() => {
        onItemCreated("web-socket", {});
        MixpanelEvent(Events.WebSocket_Button);
      }}
    />
    <Card
      icon={SocketIoIcon}
      label={`${SocketIORequestDefaultAliasBaseEnum.NAME}`}
      iconColor="var(--text-primary-300)"
      iconSize={"18px"}
      onClick={() => {
        onItemCreated("socket-io", {});
        MixpanelEvent(Events.SocketIO_Button, {
          description: "Socket Io created from Default screen page.",
          location: "Default Page",
        });
      }}
    />
    {#if !isWebApp}
      <Card
        icon={GraphIcon}
        label={`${GraphqlRequestDefaultAliasBaseEnum.NAME}`}
        iconColor="var(--text-primary-300)"
        iconSize={"18px"}
        onClick={() => {
          onItemCreated("graphql", {});
          MixpanelEvent(Events.GraphQL_button, {
            description: "Socket Io created from Default screen page.",
            location: "Default Page",
          });
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
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER && !isWebApp}
      <Card
        icon={TreeIcon}
        label={"Test Flow"}
        iconColor="var(--text-primary-300)"
        iconSize={"18px"}
        onClick={() => {
          onCreateTestflow();
          MixpanelEvent(Events.Default_Screen_TestFlows);
        }}
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
    padding: 124px 35px 24px;
  }

  .logo {
    width: 175px;
    padding-bottom: 60px;
  }

  .cards {
    display: flex;
    gap: 19px;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
