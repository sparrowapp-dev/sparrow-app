<script lang="ts">
  import { SocketExplorer } from "@sparrow/workspaces/features";
  import { environmentType } from "@sparrow/common/enums";

  // ---- View Model
  import WebSocketViewModel from "./WebSocketExplorerPage.ViewModel";
  import { RestExplorer, ChatBot } from "@sparrow/workspaces/features";
  import { Debounce } from "@sparrow/common/utils";
  import { isGuestUserActive, user } from "@app/store/auth.store";
  import { onMount } from "svelte";
  import type { Tab } from "@sparrow/common/types/workspace";
  import type { TabDocument, WorkspaceDocument } from "@app/database/database";
  import { webSocketDataStore } from "@sparrow/workspaces/features/socket-explorer/store";
  export let tab: TabDocument;
  let isLoginBannerActive = false;
  let _viewModel;
  let environments;
  let activeWorkspace;
  let isGuestUser = false;
  let userId = "";
  let userRole = "";

  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  /**
   * Find the role of user in active workspace
   */
  const findUserRole = async () => {
    const workspace = await _viewModel.getWorkspaceById(
      tab?.path?.workspaceId as string,
    );
    workspace.users?.forEach((value) => {
      if (value.id === userId) {
        userRole = value.role as string;
      }
    });
  };
  let prevTabId = "";

  let renameWithCollectionList;
  let prevTabName = "";
  $: {
    if (tab) {
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */
          _viewModel = new WebSocketViewModel(tab);
          environments = _viewModel.environments;
          activeWorkspace = _viewModel.activeWorkspace;

          activeWorkspaceSubscribe = activeWorkspace.subscribe(
            async (value: WorkspaceDocument) => {
              const activeWorkspaceRxDoc = value;
              if (activeWorkspaceRxDoc) {
                currentWorkspace = activeWorkspaceRxDoc;
                currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
                environmentId = activeWorkspaceRxDoc.get("environmentId");
              }
            },
          );

          renameWithCollectionList = new Debounce().debounce(
            _viewModel.updateNameWithCollectionList,
            1000,
          );

          const guestUser = await _viewModel.getGuestUser();
          if (guestUser?.isBannerActive) {
            isLoginBannerActive = guestUser?.isBannerActive;
          }
        })();
      } else if (tab?.name && prevTabName !== tab.name) {
        renameWithCollectionList(tab.name);
      }
      prevTabId = tab?.tabId || "";
      prevTabName = tab?.name || "";
      findUserRole();
    }
  }

  let environmentVariables = [];
  let environmentId: string = "";
  let currentWorkspaceId = "";
  let currentWorkspace;

  let activeWorkspaceSubscribe;

  /**
   * @description - refreshes the environment everytime workspace changes
   */
  const refreshEnvironment = () => {
    if ($environments && currentWorkspaceId) {
      if ($environments?.length > 0) {
        const filteredEnv = $environments
          .filter((elem) => {
            return elem.workspaceId === currentWorkspaceId;
          })
          .filter((elem) => {
            if (
              elem.type === environmentType.GLOBAL ||
              elem.id === environmentId
            ) {
              return true;
            }
          });
        if (filteredEnv?.length > 0) {
          let envs = [];
          filteredEnv.forEach((elem) => {
            environmentVariables = {
              local: filteredEnv[1],
              global: filteredEnv[0],
              filtered: [],
            };

            const temp = elem.toMutableJSON();
            temp.variable.forEach((variable) => {
              if (variable.key && variable.checked) {
                envs.unshift({
                  key: variable.key,
                  value: variable.value,
                  type: temp.type === environmentType.GLOBAL ? "G" : "E",
                  environment: temp.name,
                });
              }
            });
            environmentVariables.filtered = envs;
          });
        }
      }
    }
  };

  $: {
    if (environmentId || $environments || currentWorkspaceId) {
      refreshEnvironment();
    }
  }

  let webSocketData;
  let webSocketMap;
  $: {
    webSocketData = webSocketMap?.get(tab.tabId);
  }
  webSocketDataStore.subscribe((_webSocketMap) => {
    webSocketMap = _webSocketMap;
  });
</script>

<SocketExplorer
  collections={_viewModel.collection}
  bind:tab={_viewModel.tab}
  bind:userRole
  webSocket={webSocketData}
  {environmentVariables}
  {isGuestUser}
  isWebApp={true}
  {isLoginBannerActive}
  onUpdateRequestUrl={_viewModel.updateRequestUrl}
  onUpdateRequestParams={_viewModel.updateParams}
  onUpdateRequestName={_viewModel.updateRequestName}
  onUpdateHeaders={_viewModel.updateHeaders}
  onUpdateAutoGeneratedHeaders={_viewModel.updateAutoGeneratedHeaders}
  onUpdateMessage={_viewModel.updateMessage}
  onUpdateRequestState={_viewModel.updateRequestState}
  onSaveSocket={_viewModel.saveSocket}
  onUpdateRequestDescription={_viewModel.updateRequestDescription}
  readRequestOrFolderInCollection={_viewModel.readRequestOrFolderInCollection}
  readCollection={_viewModel.readCollection}
  readWorkspace={_viewModel.readWorkspace}
  onSaveAsSocket={_viewModel.saveAsSocket}
  onCreateFolder={_viewModel.createFolder}
  onCreateCollection={_viewModel.createCollection}
  onUpdateEnvironment={_viewModel.updateEnvironment}
  onRenameCollection={_viewModel.handleRenameCollection}
  onRenameFolder={_viewModel.handleRenameFolder}
  onConnect={_viewModel.connectWebsocket}
  onDisconnect={_viewModel.disconnectWebsocket}
  onSendMessage={_viewModel.sendMessageWebsocket}
  onSearchMessage={_viewModel.searchMessages}
  onDeleteMessage={_viewModel.deleteMessages}
  onUpdateContentType={_viewModel.updateContentType}
  onUpdateMessageBody={_viewModel.updateMessageBody}
  onClearInput={_viewModel.clearInput}
  onUpdateFilterType={_viewModel.updateFilterType}
/>
