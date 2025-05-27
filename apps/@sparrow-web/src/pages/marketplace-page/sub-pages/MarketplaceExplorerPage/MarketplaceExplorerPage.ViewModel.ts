// Repositories

import { WorkspaceService } from "@app/services/workspace.service";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import constants from "@app/constants/constants";
import { getClientUser } from "@app/utils/jwt";
import { TabRepository } from "src/repositories/tab.repository";
import { CollectionService } from "src/services/collection.service";
import { CollectionRepository } from "src/repositories/collection.repository";
import { EnvironmentService } from "src/services/environment.service";
import { EnvironmentRepository } from "src/repositories/environment.repository";
import { TestflowService } from "src/services/testflow.service";
import { TestflowRepository } from "src/repositories/testflow.repository";
import { createDeepCopy } from "@sparrow/common/utils";
import { navigate } from "svelte-navigator";
import { WorkspaceTabAdapter } from "src/adapter";

class MarketplaceExplorerViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private workspaceService = new WorkspaceService();
  private tabRepository = new TabRepository();
  private collectionService = new CollectionService();
  private collectionRepository = new CollectionRepository();
  private environmentService = new EnvironmentService();
  private environmentRepository = new EnvironmentRepository();
  private testflowService = new TestflowService();
  private testflowRepository = new TestflowRepository();

  constructor() {}

  /**
   * @description - get public workspaces list from local db
   */
  get publicWorkspaces() {
    const workspaces = this.workspaceRepository.getPublicWorkspacesDocs();
    return workspaces;
  }

  public constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  public fetchPublicWorkpsace = async (currentPage) => {
    const workspaces =
      await this.workspaceService.fetchPublicWorkspaceList(currentPage);
    return workspaces;
  };

  /**
   * Adds a workspace to repository and switches to it
   * @param workspace - Workspace document to add and switch to
   */
  public addAndSwitchWorkspace = async (workspace) => {
    const clientUser = getClientUser();
    // Check if workspace already exists
    const existingWorkspace = await this.workspaceRepository.readWorkspace(
      workspace._id,
    );

    // If workspace doesn't exist, add it to repository
    if (!existingWorkspace) {
      const {
        _id,
        name,
        description,
        workspaceType,
        users,
        admins,
        team,
        createdAt,
        createdBy,
        collection,
        updatedAt,
        updatedBy,
        isNewInvite,
      } = workspace;

      const item = {
        _id,
        name,
        description,
        workspaceType: workspaceType,
        isShared: true,
        users: [
          {
            email: clientUser?.email,
            id: clientUser?.id,
            name: clientUser?.name,
            role: "viewer",
          },
        ],
        collections: collection ? collection : [],
        admins: admins,
        team: {
          teamId: team.id,
          teamName: team.name,
          hubUrl: team?.hubUrl || "",
        },
        environmentId: "",
        isActiveWorkspace: false,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
        isNewInvite,
      };

      await this.workspaceRepository.addWorkspace(item);
    }

    // Switch to the workspace
    const workspaceData =
      existingWorkspace ||
      (await this.workspaceRepository.readWorkspace(workspace._id));
    const [
      fetchCollectionsResult,
      refreshEnvironmentResult,
      refreshTestflowResult,
    ] = await Promise.all([
      this.fetchCollections(workspaceData._id),
      this.refreshEnvironment(workspaceData._id),
      this.refreshTestflow(workspaceData._id),
    ]);
    const collectionTabsToBeDeleted =
      fetchCollectionsResult?.collectionItemTabsToBeDeleted || [];
    const environmentTabsToBeDeleted =
      refreshEnvironmentResult?.environmentTabsToBeDeleted || [];
    const testflowTabsToBeDeleted =
      refreshTestflowResult?.testflowTabsToBeDeleted || [];

    const totalTabsToBeDeleted = [
      ...collectionTabsToBeDeleted,
      ...environmentTabsToBeDeleted,
      ...testflowTabsToBeDeleted,
    ];
    await this.tabRepository.deleteTabsWithTabIdInAWorkspace(
      workspaceData._id,
      totalTabsToBeDeleted,
    );
    const initWorkspaceTab = new WorkspaceTabAdapter().adapt(
      workspace._id,
      workspaceData,
    );
    await this.tabRepository.createTab(initWorkspaceTab, workspace._id);
    await this.workspaceRepository.setActiveWorkspace(workspace._id);
    navigate("collections");
  };

  /**
   * Fetch collections from services and insert to repository
   * @param workspaceId - id of current workspace
   */
  private fetchCollections = async (
    workspaceId: string,
  ): Promise<{ collectionItemTabsToBeDeleted?: string[] }> => {
    const res = await this.collectionService.fetchPublicCollection(
      workspaceId,
      constants.API_URL,
    );
    /**
     * Iterates throught the Collection and return all the Collection item Ids - COllection, Folder, Http Request, WebSocket Request.
     * @param _collectionItem - Collection or Collection item (Folder, Http Request, WebSocket Request).
     * @param _collectionItemIds - Blank list that should be manipulated by this function as a result.
     * @returns List of COllection item Ids.
     */
    const getCollectionItemIds = (
      _collectionItem: any,
      _collectionItemIds: string[],
    ): void => {
      if (!_collectionItem?.type) {
        // Collection - object do not have type and holds _id.
        _collectionItemIds.push(_collectionItem._id);
      } else {
        // Folder, Http Request, WebSocket Request - object that holds id.
        _collectionItemIds.push(_collectionItem.id);
      }

      // Recursively search through the Collection item structure
      for (let j = 0; j < _collectionItem?.items?.length; j++) {
        getCollectionItemIds(_collectionItem.items[j], _collectionItemIds);
      }
      return;
    };
    if (res?.isSuccessful && res?.data?.data) {
      const collections = res.data.data;
      await this.collectionRepository.bulkInsertData(
        workspaceId,
        collections?.map((_collection: any) => {
          const collection = createDeepCopy(_collection);
          collection["workspaceId"] = workspaceId;
          collection["id"] = _collection._id;
          if (!collection?.description) collection.description = "";
          delete collection._id;
          return collection;
        }),
      );
      await this.collectionRepository.deleteOrphanCollections(
        workspaceId,
        collections?.map((_collection: any) => {
          return _collection._id;
        }),
      );
      const collectionItemIds: string[] = [];
      for (let i = 0; i < collections.length; i++) {
        getCollectionItemIds(collections[i], collectionItemIds);
      }

      const collectionItemTabsToBeDeleted =
        await this.tabRepository.getIdOfTabsThatDoesntExistAtCollectionLevel(
          workspaceId,
          collectionItemIds as string[],
        );

      return {
        collectionItemTabsToBeDeleted,
      };
    }

    return {};
  };

  /**
   * @description - refreshes environment data with sync to mongo server
   * @param workspaceId - workspace Id to which environment belongs
   * @returns
   */
  private refreshEnvironment = async (
    workspaceId: string,
  ): Promise<{
    environmentTabsToBeDeleted?: string[];
  }> => {
    const response = await this.environmentService.fetchAllPublicEnvironments(
      workspaceId,
      constants.API_URL,
    );
    if (response?.isSuccessful && response?.data?.data) {
      const environments = response.data.data;
      await this.environmentRepository.refreshEnvironment(
        environments?.map((_environment: any) => {
          const environment = createDeepCopy(_environment);
          environment["id"] = environment._id;
          environment["workspaceId"] = workspaceId;
          delete environment._id;
          return environment;
        }),
      );
      await this.environmentRepository.deleteOrphanEnvironments(
        workspaceId,
        environments?.map((_environment: any) => {
          return _environment._id;
        }),
      );
      const environmentTabsToBeDeleted =
        await this.tabRepository.getIdOfTabsThatDoesntExistAtEnvironmentLevel(
          workspaceId,
          environments?.map((_environment: any) => {
            return _environment._id;
          }),
        );
      return {
        environmentTabsToBeDeleted,
      };
    }
    return {};
  };

  /**
   * @description - refreshes testflow data with sync to mongo server
   * @param workspaceId - workspace Id to which testflow belongs
   * @returns
   */
  private refreshTestflow = async (
    workspaceId: string,
  ): Promise<{
    testflowTabsToBeDeleted?: string[];
  }> => {
    const response = await this.testflowService.fetchAllPublicTestflow(
      workspaceId,
      constants.API_URL,
    );
    if (response?.isSuccessful && response?.data?.data) {
      const testflows = response.data.data;
      await this.testflowRepository.refreshTestflow(
        testflows?.map((_testflow: any) => {
          const testflow = createDeepCopy(_testflow);
          testflow["workspaceId"] = workspaceId;
          return testflow;
        }),
      );
      await this.testflowRepository.deleteOrphanTestflows(
        workspaceId,
        testflows?.map((_testflow: any) => {
          return _testflow._id;
        }),
      );
      const testflowTabsToBeDeleted =
        await this.tabRepository.getIdOfTabsThatDoesntExistAtTestflowLevel(
          workspaceId,
          testflows?.map((_testflow: any) => {
            return _testflow._id;
          }),
        );
      return {
        testflowTabsToBeDeleted,
      };
    }
    // debugger;
    return {};
  };
}

export default MarketplaceExplorerViewModel;
