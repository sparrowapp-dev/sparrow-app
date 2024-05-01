// Repositories
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { TabRepository } from "$lib/repositories/tab.repository";

// Servises
import { CollectionService } from "$lib/services/collection.service";

// Types
import type {
  CollectionDocument,
  TabDocument,
} from "$lib/database/app.database";
import { workspaceLevelPermissions } from "$lib/utils/constants/permissions.constant";

// Notification
import { notifications } from "$lib/components/toast-notification/ToastNotification";

// Utils
import { hasWorkpaceLevelPermission, moveNavigation } from "$lib/utils/helpers";
import {
  ItemType,
  ResponseStatusCode,
  UntrackedItems,
  WorkspaceRole,
} from "$lib/utils/enums";
import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";

// Stores
import { userWorkspaceLevelRole } from "$lib/store";
import { generateSampleRequest } from "$lib/utils/sample";
import type { Folder, Path } from "$lib/utils/interfaces/request.interface";
import { InitRequestTab } from "@common/utils";

class CollectionExplorerPage {
  // Private Repositories
  private collectionRepository = new CollectionRepository();
  private tabRepository = new TabRepository();

  // Private Services
  private collectionService = new CollectionService();

  // Private Variables
  private tab: TabDocument;

  constructor(_tab: TabDocument) {
    this.tab = _tab;
  }

  /**
   * Handle updating tab
   * @param data :any - tab data i.e. collection, folder or request
   * @param route :string - path to collection, folder or request
   * @param _id :string - if of the tab
   */
  private updateTab = async (_id: string, data: TabDocument) => {
    this.tabRepository.updateTab(_id, data);
  };

  /**
   * Get role of the user in workspace
   * @returns :UserRole - role of the user in workspace
   */
  public getUserRoleInWorspace = async () => {
    let role: WorkspaceRole;
    const userWorkspaceLevelRoleSubscribe = userWorkspaceLevelRole.subscribe(
      (value: any) => {
        role = WorkspaceRole.WORKSPACE_ADMIN;
      },
    );
    userWorkspaceLevelRoleSubscribe();
    return await hasWorkpaceLevelPermission(
      role,
      workspaceLevelPermissions.SAVE_REQUEST,
    );
  };

  public getCollection = async (collectionId: string) => {
    return await this.collectionRepository.readCollection(collectionId);
  };

  public getCollectionList = async () => {
    return await this.collectionRepository.getCollection();
  };

  /**
   * Handles renaming a collection
   * @param newCollectionName :string - the new name of the collection
   */
  public handleRename = async (
    collection: CollectionDocument,
    newCollectionName: string,
  ) => {
    if (newCollectionName) {
      const response = await this.collectionService.updateCollectionData(
        collection.id,
        collection.workspaceId,
        { name: newCollectionName },
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collection.id,
          response.data.data,
        );
        this.updateTab(this.tab.tabId, response.data.data);
        notifications.success("Collection renamed successfully!");
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to rename collection!");
      }
    }
    newCollectionName = "";
  };

  public handleBranchChanged = async (
    collection: CollectionDocument,
    newBranch: string,
  ) => {
    const response = await this.collectionService.switchCollectionBranch(
      collection.id,
      newBranch,
    );
    if (response.isSuccessful) {
      this.collectionRepository.updateCollection(collection?.id, {
        currentBranch: newBranch,
        items: response.data.data.items,
      });
    } else {
      this.collectionRepository.updateCollection(collection?.id, {
        currentBranch: newBranch,
        items: [],
      });
    }
    await this.tabRepository.clearTabs();
    notifications.success("Branch switched successfully.");
  };

  /**
   * Handle refetching collection from local repository in active sync enabled collections
   * @param workspaceId :string - the workspace ID
   * @param collection :CollectionDocument - The collection going to be refetched
   */
  public handleRefetchCollection = async (collection: CollectionDocument) => {
    const errMessage = `Failed to sync the collection. Local reposisitory branch is not set to ${collection?.currentBranch}.`;

    try {
      const activeResponse = await invoke("get_git_active_branch", {
        path: collection?.localRepositoryPath,
      });
      if (activeResponse) {
        const currentBranch: string = activeResponse;
        if (collection?.currentBranch) {
          if (currentBranch !== collection?.currentBranch) {
            notifications.error(errMessage);
            return;
          }
        } else {
          if (currentBranch !== collection?.primaryBranch) {
            notifications.error(errMessage);
            return;
          }
        }
      } else {
        notifications.error(errMessage);
        return;
      }
    } catch (e) {
      notifications.error(errMessage);
      return;
    }
    const responseJSON =
      await this.collectionService.validateImportCollectionURL(
        collection.activeSyncUrl,
      );
    if (responseJSON?.data?.status === ResponseStatusCode.OK) {
      const response = await this.collectionService.importCollection(
        collection.workspaceId,
        {
          url: collection.activeSyncUrl,
          urlData: {
            data: JSON.parse(responseJSON.data.response),
            headers: responseJSON.data.headers,
          },
          primaryBranch: collection?.primaryBranch,
          currentBranch: collection?.currentBranch
            ? collection?.currentBranch
            : collection?.primaryBranch,
        },
        collection.activeSync,
      );

      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collection.id,
          response.data.data.collection,
        );
        notifications.success("Collection synced.");
      } else {
        notifications.error("Failed to sync the collection. Please try again.");
      }
    } else {
      notifications.error(
        `Unable to detect ${collection.activeSyncUrl.replace("-json", "")}.`,
      );
    }
  };

  public handleSyncCollection = async (collection: CollectionDocument) => {
    const errMessage = `Failed to sync the collection. Local reposisitory branch is not set to ${collection?.currentBranch}.`;
    try {
      const activeResponse = await invoke("get_git_active_branch", {
        path: collection?.localRepositoryPath,
      });
      if (activeResponse) {
        const currentBranch = activeResponse;
        if (collection?.currentBranch) {
          if (currentBranch !== collection?.currentBranch) {
            notifications.error(errMessage);
            return false;
          }
        } else {
          if (currentBranch !== collection?.primaryBranch) {
            notifications.error(errMessage);
            return false;
          }
        }
      } else {
        notifications.error(errMessage);
        return false;
      }
    } catch (e) {
      notifications.error(errMessage);
      return false;
    }
    const responseJSON =
      await this.collectionService.validateImportCollectionURL(
        collection.activeSyncUrl,
      );
    if (responseJSON?.data?.status === ResponseStatusCode.OK) {
      const response = await this.collectionService.importCollection(
        collection.workspaceId,
        {
          url: collection?.activeSyncUrl,
          urlData: {
            data: JSON.parse(responseJSON.data.response),
            headers: responseJSON.data.headers,
          },
          primaryBranch: collection?.primaryBranch,
          currentBranch: collection?.currentBranch,
        },
        collection.activeSync,
      );

      if (response.isSuccessful) {
        await this.collectionRepository.updateCollection(
          collection?.id,
          response.data.data.collection,
        );
        notifications.success("Collection synced.");
        return true;
      } else {
        notifications.error("Failed to sync the collection. Please try again.");
        return false;
      }
    } else {
      notifications.error(
        `Unable to detect ${collection?.activeSyncUrl.replace("-json", "")}.`,
      );
      return false;
    }
  };

  private updateCounts = async (
    collection: CollectionDocument,
    tab: TabDocument,
  ) => {
    let totalRequests = 0;
    let totalFolders = 0;
    collection?.items.forEach((collectionItem: CollectionDocument) => {
      if (collectionItem.type === ItemType.REQUEST) {
        totalRequests++;
      } else {
        totalFolders++;
        totalRequests += collectionItem.items.length;
      }
    });
    const newTab = {
      property: {
        totalRequests,
        totalFolders,
      },
    };
    this.tabRepository.updateTab(tab.tabId, newTab);
    this.tabRepository
      .getTab()
      .subscribe((_tab) => {
        if (_tab) {
          this.tab = _tab;
        }
      })
      .unsubscribe();
  };

  public getLastUpdatedAndCount = async (
    collection: CollectionDocument,
    tab: TabDocument,
  ) => {
    await this.updateCounts(collection, tab);
    let isSynced: boolean;
    const response = await this.collectionService.switchCollectionBranch(
      collection?.id,
      collection?.currentBranch,
    );
    if (response.isSuccessful) {
      isSynced = true;
    } else {
      isSynced = false;
    }
    return isSynced;
  };

  /**
   * Handles opening a request on a tab
   * @param request : - The request going to be opened on tab
   * @param path : - The path to the request
   */
  public handleOpenRequest = (
    workspaceId: string,
    collection: CollectionDocument,
    folder: Folder,
    request: Request,
  ) => {
    const req = new InitRequestTab(request.id, collection.workspaceId);
    const path: Path = {
      workspaceId: collection.workspaceId,
      collectionId: collection.id ?? "",
      folderId: folder?.id,
      folderName: folder?.name,
    };
    req.updateName(request.name);
    req.updateDescription(request.description);
    req.updateBody(request.request?.body);
    req.updateMethod(request.request?.method);
    req.updateUrl(request.request?.url);
    req.updateQueryParams(request.request?.queryParams);
    req.updateAuth(request.request?.auth);
    req.updateHeaders(request.request?.headers);
    req.updatePath(path);

    this.tabRepository.createTab(req.getValue());
    moveNavigation("right");
  };

  /**
   * Handle creating a new request in a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @returns :void
   */
  public handleCreateRequest = async (collection: CollectionDocument) => {
    if (!(await this.getUserRoleInWorspace())) {
      return;
    }
    const request = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );

    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    const requestObj = {
      collectionId: collection.id,
      workspaceId: collection.workspaceId,
      ...userSource,
      items: {
        name: request.name,
        type: request.type,
        description: "",
        request: {
          method: request?.property?.request?.method,
        },
      },
    };
    this.collectionRepository.addRequestOrFolderInCollection(collection.id, {
      ...requestObj.items,
      id: request.id,
    });
    const response =
      await this.collectionService.addRequestInCollection(requestObj);
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        request.id,
        res,
      );

      request.id = res.id;
      request.path.workspaceId = collection.workspaceId;
      request.path.collectionId = collection.id;
      request.property.request.save.api = true;
      request.property.request.save.description = true;

      this.handleOpenRequest(
        collection.workspaceId,
        collection,
        {
          id: "",
          name: "",
        },
        request,
      );
      moveNavigation("right");
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        request.id,
      );
      notifications.error(response.message);
    }
  };

  public handleUpdateDescription = async (
    collection: CollectionDocument,
    newDescription: string,
  ) => {
    await this.collectionRepository.updateCollection(collection.id, {
      description: newDescription,
    });
  };
}

export default CollectionExplorerPage;
