// Repositories
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { TabRepository } from "../../../../repositories/tab.repository";

// Servises
import { CollectionService } from "../../../../services/collection.service";

// Types
import type {
  // CollectionDocument,
  TabDocument,
} from "../../../../database/database";

// Utils
import { createDeepCopy, Debounce } from "@sparrow/common/utils";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { BehaviorSubject, type Observable } from "rxjs";
import { FolderTabAdapter } from "@app/adapter";
import constants from "@app/constants/constants";
import { notifications } from "@sparrow/library/ui";
// import { InitRequestTab } from "@sparrow/common/utils";

class MockHistoryExplorerPage {
  // Private Repositories
  private collectionRepository = new CollectionRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();

  // Private Services
  private collectionService = new CollectionService();

  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});

  constructor(_tab: TabDocument) {
    const t = createDeepCopy(_tab.toMutableJSON());
    delete t.isActive;
    delete t.index;
    t.persistence = TabPersistenceTypeEnum.PERMANENT;
    this.tab = t;
  }

  public get tab(): Observable<Tab> {
    return this._tab.asObservable();
  }

  public set tab(value: Tab) {
    this._tab.next(value);
  }

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
   * @returns Observable collection list
   */
  public getCollectionList = async () => {
    return await this.collectionRepository.getCollection();
  };

  public constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  public getCollectionByIdAndWorkspace = async (
    collectionId: string,
    workspaceId: string,
  ) => {
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const response = await this.collectionService.geCollectionByIdAndWorkspace(
      collectionId,
      workspaceId,
      baseUrl,
    );

    if (response?.isSuccessful) {
      await this.collectionRepository.updateCollection(collectionId, {
        ...response.data.data,
        id: response.data.data._id,
        workspaceId: workspaceId,
      });
    } else {
      notifications.error("Failed to fetch collection. Please try again.");
    }
  };
}

export default MockHistoryExplorerPage;
