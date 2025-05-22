// Repositories
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { TabRepository } from "../../../../repositories/tab.repository";

// Servises
import { CollectionService } from "../../../../services/collection.service";

// Types
import type {
  CollectionDocument,
  // CollectionDocument,
  TabDocument,
} from "../../../../database/database";

// Utils
import {
  createDeepCopy,
  Debounce,
  InitMockRequestTab,
  InitWebSocketTab,
  moveNavigation,
} from "@sparrow/common/utils";
import { Events, ItemType, UntrackedItems } from "@sparrow/common/enums";
// import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";

import { InitRequestTab } from "@sparrow/common/utils";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { notifications } from "@sparrow/library/ui";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { isGuestUserActive } from "@app/store/auth.store";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { BehaviorSubject, type Observable } from "rxjs";
import { FolderTabAdapter } from "@app/adapter";
import {
  CollectionItemTypeBaseEnum,
  type CollectionBaseInterface,
  type CollectionItemBaseInterface,
} from "@sparrow/common/types/workspace/collection-base";
import type { GraphqlRequestCreateUpdateInFolderPayloadDtoInterface } from "@sparrow/common/types/workspace/graphql-request-dto";
import { InitTab } from "@sparrow/common/factory";
import type { SocketIORequestCreateUpdateInFolderPayloadDtoInterface } from "@sparrow/common/types/workspace/socket-io-request-dto";
import constants from "@app/constants/constants";
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
   * Compares the current collection tab with the server collection and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */
  private compareCollectionWithServerDebounced = async () => {
    let result = true;
    const progressiveTab = createDeepCopy(this._tab.getValue());

    const folder =
      await this.collectionRepository.readRequestOrFolderInCollection(
        progressiveTab.path.collectionId,
        progressiveTab.id,
      );

    const collectionTab = new FolderTabAdapter().adapt(
      progressiveTab.id,
      "",
      folder,
    );

    if (!folder) result = false;
    // description
    else if (collectionTab.description !== progressiveTab.description) {
      result = false;
    }
    // name
    else if (collectionTab.name !== progressiveTab.name) {
      result = false;
    }

    // result
    if (result) {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: true,
      });
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
      });
      progressiveTab.isSaved = false;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current collection tab with the server collection.
   */
  private compareCollectionWithServer = new Debounce().debounce(
    this.compareCollectionWithServerDebounced,
    1000,
  );

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
}

export default MockHistoryExplorerPage;
