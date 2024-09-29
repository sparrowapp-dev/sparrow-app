// Repositories
import { CollectionRepository } from "../../repositories/collection.repository";
import { TabRepository } from "../../repositories/tab.repository";

// Servises
import { CollectionService } from "../../services/collection.service";

// Types
import type {
  CollectionDocument,
  // CollectionDocument,
  TabDocument,
} from "../../database/database";

// Utils
import { moveNavigation } from "@deprecate/utils/helpers";
import { Events, ItemType } from "@deprecate/utils/enums";
// import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";

// Stores
import type {
  CollectionDto,
  CollectionItemsDto,
  Folder,
  Tab,
} from "@sparrow/common/types/workspace";
import type { CreateApiRequestPostBody } from "@deprecate/utils/dto";
import { InitRequestTab } from "@sparrow/common/utils";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { notifications } from "@sparrow/library/ui";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { isGuestUserActive } from "@app/store/auth.store";
// import { generateSampleRequest } from "@deprecate/utils/sample";
// import type { Folder, Path } from "@deprecate/utils/interfaces/request.interface";
// import { InitRequestTab } from "@sparrow/common/utils";

class FolderExplorerPage {
  // Private Repositories
  private collectionRepository = new CollectionRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();

  // Private Services
  private collectionService = new CollectionService();

  constructor() {}

  /**
   *
   * @param _id - Id of the tab going to be updated
   * @param data - Data to be updated on tab
   */
  private updateTab = async (_id: string, data: Tab) => {
    this.tabRepository
      .getTabList()
      .subscribe((tabList) => {
        tabList.forEach((tab) => {
          if (tab.id === _id) {
            this.tabRepository.updateTab(tab?.tabId as string, data);
          }
        });
      })
      .unsubscribe();
  };

  /**
   *
   * @param collectionId - Id of the collection to be fetched
   * @returns - Requested collection
   */
  public getCollection = async (collectionId: string) => {
    return await this.collectionRepository.readCollection(collectionId);
  };

  /**
   *
   * @param collection - Collection in which folder exists
   * @param folderId - Id of folder going to be fetched
   * @returns - Requested Folder
   */
  public getFolder = async (
    collection: CollectionDocument,
    folderId: string,
  ) => {
    let folder: Folder | null = null;
    if (collection) {
      collection.items.forEach((_folder) => {
        if (_folder.id === folderId) {
          folder = _folder;
        }
      });
    }
    return folder;
  };

  /**
   *
   * @returns Observable collection list
   */
  public getCollectionList = async () => {
    return await this.collectionRepository.getCollection();
  };

  /**
   * Handles renaming a folder
   * @param collection :CollectionDocument - the collection in which the folder is saved
   * @param folder : - the folder going to be renamed
   * @param newFolderName :string - the new name of the folder
   */
  public handleRename = async (
    collection: CollectionDocument,
    folder: Folder,
    newFolderName: string,
  ) => {
    if (newFolderName) {
      let userSource = {};
      if (collection.activeSync && folder?.source === "USER") {
        userSource = {
          currentBranch: collection.currentBranch
            ? collection.currentBranch
            : collection.primaryBranch,
          source: "USER",
        };
      }
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser === true) {
        this.updateTab(folder.id, { name: newFolderName });
        const res =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collection.id,
            folder.id,
          );
        res.name = newFolderName;
        this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          folder.id,
          res,
        );
        notifications.success("Folder renamed successfully!");
        return;
      }
      const response = await this.collectionService.updateFolderInCollection(
        collection.workspaceId,
        collection.id,
        folder.id,
        {
          ...userSource,
          name: newFolderName,
        },
      );

      if (response.isSuccessful) {
        this.updateTab(folder.id, { name: newFolderName });
        this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          folder.id,
          response.data.data,
        );
        notifications.success("Folder renamed successfully!");
      }
    }
  };

  /**
   *
   * @param collection - Collection in which request exists
   * @param folder - Folder in which request exists
   * @param request - Request going to be opened
   */
  public handleOpenRequest = (
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
   *
   * @param collection - Collection in which request going to be created
   * @param folder - Folder in which request going to be created
   * @returns
   */
  public handleCreateAPIRequest = async (
    collection: CollectionDto,
    folder: CollectionItemsDto,
  ) => {
    const initRequestTab = new InitRequestTab(
      uuidv4(),
      collection?.workspaceId,
    );

    let userSource = {};
    if (collection.activeSync && folder?.source === "USER") {
      userSource = {
        currentBranch: collection.currentBranch
          ? collection.currentBranch
          : collection.primaryBranch,
        source: "USER",
      };
    }

    const requestObj: CreateApiRequestPostBody = {
      collectionId: collection.id,
      workspaceId: collection.workspaceId,
      ...userSource,
      folderId: folder.id,
      items: {
        name: folder.name,
        type: ItemType.FOLDER,
        items: {
          name: initRequestTab.getValue().name,
          type: initRequestTab.getValue().type,
          description: "",
          request: {
            method: initRequestTab?.getValue()?.property.request.method,
          },
        },
      },
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser) {
      // pushing http request to collection model
      await this.collectionRepository.addRequestInFolder(
        requestObj.collectionId as string,
        requestObj.folderId as string,
        {
          ...requestObj?.items?.items,
          id: initRequestTab.getValue().id,
        },
      );
      // pushing http request to tab model
      initRequestTab.updatePath({
        workspaceId: collection.workspaceId,
        collectionId: collection.id,
        folderId: folder.id,
      });
      initRequestTab.updateIsSave(true);
      await this.tabRepository.createTab(initRequestTab.getValue());
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
        source: "Side Panel Dropdown",
      });
      return;
    }

    const response =
      await this.collectionService.addRequestInCollection(requestObj);
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;
      // pushing http request to collection model
      await this.collectionRepository.addRequestInFolder(
        requestObj?.collectionId as string,
        requestObj?.folderId as string,
        {
          ...request,
        },
      );
      // pushing http request to tab model
      initRequestTab.updateId(request.id);
      initRequestTab.updatePath({
        workspaceId: collection.workspaceId,
        collectionId: collection.id,
        folderId: folder.id,
      });
      initRequestTab.updateIsSave(true);
      this.tabRepository.createTab(initRequestTab.getValue());
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
        source: "Side Panel Dropdown",
      });
      return;
    } else {
      notifications.error("Failed to create API");
    }
  };

  /**
   *
   * @param tab - Tab in which description will be updated
   * @param newDescription - New description
   */
  public handleUpdateDescription = async (
    tab: TabDocument,
    newDescription: string,
  ) => {
    const updateObj = {};
    updateObj["description"] = newDescription;
    let userSource = {};
    if (tab?.activeSync && tab?.source === "USER") {
      userSource = {
        currentBranch: tab?.currentBranch,
        source: "USER",
      };
    }
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const res =
        await this.collectionRepository.readRequestOrFolderInCollection(
          tab.path.collectionId,
          tab.path.folderId,
        );
      res.description = newDescription;
      await this.collectionRepository.updateRequestOrFolderInCollection(
        tab.path.collectionId,
        tab.path.folderId,
        res,
      );
      notifications.success("Description updated successfully!");
      return;
    }

    const updateFolderElement =
      await this.collectionService.updateFolderInCollection(
        tab.path.workspaceId,
        tab.path.collectionId,
        tab.path.folderId,
        { ...updateObj, ...userSource },
      );
    if (updateFolderElement.isSuccessful) {
      await this.collectionRepository.updateRequestOrFolderInCollection(
        tab.path.collectionId,
        tab.path.folderId,
        updateFolderElement.data.data,
      );
      notifications.success("Description updated successfully!");
    } else {
      notifications.error("Failed to update description!");
    }
  };

  /**
   *
   * @param collection - Collection in which folder exists
   * @param tab - Tab of the folder
   * @returns - Total number of requests in folder
   */
  public getTotalRequests = async (
    collection: CollectionDocument,
    tab: TabDocument,
  ) => {
    let totalRequests = 0;
    const folder = await this.getFolder(collection, tab.id);
    if (folder?.items) {
      folder.items.forEach((item: CollectionItemsDto) => {
        if (item.type === ItemType.REQUEST) {
          totalRequests++;
        }
      });
    }
    return totalRequests;
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

export default FolderExplorerPage;
