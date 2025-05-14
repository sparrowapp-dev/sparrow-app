<script lang="ts">
  // Document
  import type {
    CollectionDocument,
    TabDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { onMount, onDestroy } from "svelte";

  // ---- View Model
  import CollectionExplorerPage from "./CollectionExplorerPage.ViewModel";

  // Component
  import { CollectionExplorer } from "@sparrow/workspaces/features";
  import type { Observable } from "rxjs";
  import { user } from "@app/store/auth.store";
  import type {
    EnvironmentDocumentBaseInterface,
    EnvironmentFilteredVariableBaseInterface,
    EnvironmentLocalGlobalJoinBaseInterface,
  } from "@sparrow/common/types/workspace/environment-base";
  import { getClientUser } from "@app/utils/jwt";
  import { environmentType, WorkspaceRole } from "@sparrow/common/enums";
  import { Debounce } from "@sparrow/common/utils";

  // Exports
  export let tab: TabDocument;
  export let onSyncCollection;
  export let onMockCollectionModelOpen;

  // ViewModel initialization
  const _viewModel = new CollectionExplorerPage(tab);

  let userId = "";
  let userRole = "";

  // Local variables
  let collection: CollectionDocument;

  let prevTabName = "";

  /**
   * produces delay to update name of a collection.
   */
  const renameWithCollectionList = new Debounce().debounce(
    _viewModel.updateNameWithCollectionList as any,
    1000,
  );

  /**
   * Reacts whenever the collection tab changes.
   */
  $: {
    if (tab) {
      if (prevTabName !== tab.name) {
        renameWithCollectionList(tab.name);
      }
      prevTabName = tab.name;
    }
  }

  // Initialization of collection and userRoleInWorkspace
  onMount(async () => {
    (await _viewModel.getCollectionList()).subscribe(
      async (_collectionList) => {
        const response = await _viewModel.getCollection(tab.id);
        if (response) {
          collection = response?.toMutableJSON();
        }
      },
    );
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
    const workspace: WorkspaceDocument = await _viewModel.getWorkspaceById(
      tab.path.workspaceId,
    );
    workspace.users?.forEach((value) => {
      if (value.id === userId) {
        userRole = value.role as string;
      }
    });
  };

  let isCollectionEditable = false;
  const environments = _viewModel.environments;
  let environmentVariables: EnvironmentLocalGlobalJoinBaseInterface;
  let environmentId: string;
  let currentWorkspaceId = "";
  let currentWorkspace;
  let isSharedWorkspace = false;
  const activeWorkspaceSubscribe = _viewModel.activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value.toMutableJSON();
      if (activeWorkspaceRxDoc) {
        currentWorkspace = activeWorkspaceRxDoc;
        isSharedWorkspace = activeWorkspaceRxDoc.isShared;
        currentWorkspaceId = activeWorkspaceRxDoc._id;
        environmentId = activeWorkspaceRxDoc.environmentId as string;
        const clientUserId = getClientUser().id;
        if (clientUserId) {
          let isUserViewer = false;
          activeWorkspaceRxDoc.users?.forEach((_user) => {
            if (_user.id === clientUserId) {
              if (_user.role === WorkspaceRole.WORKSPACE_VIEWER) {
                isUserViewer = true;
              }
            }
          });
          if (isUserViewer) {
            isCollectionEditable = false;
          } else {
            isCollectionEditable = true;
          }
        } else {
          isCollectionEditable = true;
        }
      }
    },
  );

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
          })
          .map((_env) => {
            return _env.toMutableJSON() as EnvironmentDocumentBaseInterface;
          });
        if (filteredEnv?.length > 0) {
          let envs: EnvironmentFilteredVariableBaseInterface[] = [];
          filteredEnv.forEach((temp) => {
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
          });
          environmentVariables = {
            local: filteredEnv[1],
            global: filteredEnv[0],
            filtered: envs,
          };
        }
      }
    }
  };

  $: {
    if (environmentId || $environments || currentWorkspaceId) {
      refreshEnvironment();
    }
  }

  onMount(() => {
    findUserRole();
  });

  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<CollectionExplorer
  {onMockCollectionModelOpen}
  {isCollectionEditable}
  onUpdateEnvironment={_viewModel.updateEnvironment}
  isWebApp={true}
  tab={_viewModel.tab}
  bind:collection
  {environmentVariables}
  {onSyncCollection}
  {isSharedWorkspace}
  onUpdateDescription={_viewModel.handleUpdateDescription}
  onItemCreated={_viewModel.handleCreateItem}
  onCreateAPIRequest={_viewModel.handleCreateRequest}
  onCollectionSynced={_viewModel.handleSyncCollection}
  onSaveCollection={_viewModel.handleSaveCollection}
  onRename={_viewModel.handleRename}
  onCollectionRefetched={_viewModel.handleRefetchCollection}
  onBranchChanged={_viewModel.handleBranchChanged}
  getLastUpdatedAndCount={_viewModel.getLastUpdatedAndCount}
  onUpdateCollectionState={_viewModel.updateCollectionState}
  onUpdateCollectionAuth={_viewModel.updateCollectionAuth}
/>
