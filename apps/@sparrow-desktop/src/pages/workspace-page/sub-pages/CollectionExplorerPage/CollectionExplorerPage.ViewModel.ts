// Repositories
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { TabRepository } from "../../../../repositories/tab.repository";

// Servises
import { CollectionService } from "../../../../services/collection.service";

// Types
import type {
  CollectionDocument,
  TabDocument,
} from "../../../../database/database";

// Notification
import { notifications } from "@sparrow/library/ui";

// Utils
import { moveNavigation } from "@sparrow/common/utils";
import {
  ItemType,
  ResponseStatusCode,
  UntrackedItems,
} from "@sparrow/common/enums";
import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";

// Stores
import { InitRequestTab } from "@sparrow/common/utils";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { isGuestUserActive } from "@app/store/auth.store";
import type {
  CollectionDto,
  CollectionItemsDto,
} from "@sparrow/common/types/workspace";

class CollectionExplorerPage {
  // Private Repositories
  private collectionRepository = new CollectionRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();

  // Private Services
  private collectionService = new CollectionService();

  // Private Variables
  private tab: TabDocument;

  constructor(_tab: TabDocument) {
    this.tab = _tab;
  }

  /**
   * To update the tab
   * @param _id - id of the tab
   * @param data - data in the tab
   */
  private updateTab = async (_id: string, data: TabDocument) => {
    this.tabRepository.updateTab(_id, data);
  };

  /**
   *
   * @param collectionId - id of collection to fetch
   * @returns return collection
   */
  public getCollection = async (collectionId: string) => {
    return await this.collectionRepository.readCollection(collectionId);
  };

  /**
   *
   * @returns Observable collection list
   */
  public getCollectionList = async () => {
    return await this.collectionRepository.getCollection();
  };

  /**
   * Handles renaming a collection
   * @param collection - collction to rename
   * @param newCollectionName :string - the new name of the collection
   */
  public handleRename = async (
    collection: CollectionDocument,
    newCollectionName: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      if (newCollectionName) {
        const response = {
          data: {
            name: newCollectionName,
          },
        };
        await this.collectionRepository.updateCollection(
          collection.id,
          response.data,
        );
        this.updateTab(this.tab.tabId, { name: newCollectionName });
        // notifications.success("Collection renamed successfully!");
      } else {
        notifications.error("Failed to rename collection. Please try again.");
      }
      return;
    }
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
        this.updateTab(this.tab.tabId, { name: newCollectionName });
        // notifications.success("Collection renamed successfully!");
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to rename collection. Please try again.");
      }
    }
  };

  /**
   *
   * @param collection - Collection in which branch is going to change
   * @param newBranch - New branch to be changed
   */
  public handleBranchChanged = async (
    collection: CollectionDocument,
    newBranch: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      return;
    }
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
   *
   * @param collection Collection going to be refetched
   * @returns
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
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser === true) {
        return;
      }
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
        notifications.success("Collection synced successfully.");
      } else {
        notifications.error("Failed to sync the collection. Please try again.");
      }

      notifications.error(
        `Unable to detect ${collection.activeSyncUrl.replace("-json", "")}.`,
      );
    }
  };

  /**
   *
   * @param collection - Collection going to be synced
   * @returns
   */
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
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      return;
    }
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
        notifications.success("Collection synced successfully.");
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

  /**
   *
   * @param collection Collection in which folder and request will be counted
   * @returns isSynced, totalRequests, totalFolders, lastUpdated
   */
  public getLastUpdatedAndCount = async (collection: CollectionDto) => {
    const isSynced = false;
    const monthNamesAbbreviated = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const lastUpdated: string = `${
      monthNamesAbbreviated[new Date(collection?.updatedAt).getMonth()]
    } ${new Date(collection?.updatedAt).getDate()}, ${new Date(
      collection?.updatedAt,
    ).getFullYear()}`;
    let totalRequests = 0;
    let totalFolders = 0;
    if (collection?.items) {
      collection?.items.forEach((collectionItem: CollectionItemsDto) => {
        if (collectionItem.type === ItemType.REQUEST) {
          totalRequests++;
        } else if (collectionItem.type === ItemType.FOLDER) {
          totalFolders++;
          if (collectionItem?.items)
            collectionItem.items.forEach((item: CollectionItemsDto) => {
              if (item.type === ItemType.REQUEST) {
                totalRequests++;
              }
            });
        }
      });
    }
    // let isGuestUser;
    // isGuestUserActive.subscribe((value) => {
    //   isGuestUser = value;
    // });

    // active sync endpoint currently not in use
    // if (isGuestUser === true) {
    //   return {
    //     isSynced,
    //     totalFolders,
    //     totalRequests,
    //     lastUpdated,
    //   };
    // }
    // const response = await this.collectionService.switchCollectionBranch(
    //   collection?.id,
    //   collection?.currentBranch,
    // );

    // if (response && response.isSuccessful) {
    //   isSynced = true;
    // } else {
    //   isSynced = false;
    // }
    return {
      isSynced,
      totalFolders,
      totalRequests,
      lastUpdated,
    };
  };

  /**
   *
   * @param collection - Collection in which request is going to be created
   * @returns
   */
  public handleCreateRequest = async (collection: CollectionDocument) => {
    // const request = generateSampleRequest(
    //   UntrackedItems.UNTRACKED + uuidv4(),
    //   new Date().toString(),
    // );
    const initRequestTab = new InitRequestTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      collection.workspaceId,
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
        name: initRequestTab.getValue().name,
        type: initRequestTab.getValue().type,
        description: "",
        request: {
          method: initRequestTab.getValue().property?.request?.method,
        },
      },
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    let response;
    if (isGuestUser == true) {
      const res = {
        id: uuidv4(),
        name: "API Request Name",
        type: "REQUEST",
        description: "",
        source: "USER",
        isDeleted: false,
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        request: {
          method: "GET",
        },
      };
      this.collectionRepository.addRequestOrFolderInCollection(
        collection.id,
        res,
      );

      // request.id = res.id;
      // request.path.workspaceId = collection.workspaceId;
      // request.path.collectionId = collection.id;
      // request.property.request.save.api = true;
      // request.property.request.save.description = true;

      initRequestTab.updateId(res.id);
      initRequestTab.updatePath({
        workspaceId: collection.workspaceId,
        collectionId: collection.id,
      });
      initRequestTab.updateIsSave(true);
      this.tabRepository.createTab(initRequestTab.getValue());
      moveNavigation("right");
      return;
    } else {
      response =
        await this.collectionService.addRequestInCollection(requestObj);
      if (response.isSuccessful && response.data.data) {
        const res = response.data.data;
        this.collectionRepository.addRequestOrFolderInCollection(
          collection.id,
          res,
        );

        // request.id = res.id;
        // request.path.workspaceId = collection.workspaceId;
        // request.path.collectionId = collection.id;
        // request.property.request.save.api = true;
        // request.property.request.save.description = true;

        initRequestTab.updateId(res.id);
        initRequestTab.updatePath({
          workspaceId: collection.workspaceId,
          collectionId: collection.id,
        });
        initRequestTab.updateIsSave(true);
        // this.handleOpenRequest(
        //   collection.workspaceId,
        //   collection,
        //   {
        //     id: "",
        //     name: "",
        //   },
        //   request,
        // );
        this.tabRepository.createTab(initRequestTab.getValue());
        moveNavigation("right");
        return;
      } else {
        notifications.error(response.message);
      }
    }
  };

  /**
   *
   * @param collection - Collection in which description going to be updated
   * @param newDescription - New description
   */
  public handleUpdateDescription = async (
    collection: CollectionDocument,
    newDescription: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser == true) {
      await this.collectionRepository.updateCollection(
        collection.id as string,
        {
          description: newDescription,
        },
      );
      notifications.success("Description updated successfully.");
      return;
    }
    const response = await this.collectionService.updateCollectionData(
      collection.id,
      collection.workspaceId,
      { description: newDescription },
    );
    if (response.isSuccessful) {
      this.collectionRepository.updateCollection(
        collection.id,
        response.data.data,
      );
      const res = {
        data: { description: newDescription },
      };
      await this.collectionRepository.updateCollection(collection.id, res.data);
      notifications.success("Description updated successfully.");
    } else if (response.message === "Network Error") {
      notifications.error(response.message);
    } else {
      notifications.error("Failed to update description. Please try again.");
    }
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };
}

export default CollectionExplorerPage;
