import {
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
  type RxDocument,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import {
  workspaceSchema,
  type WorkspaceDocType,
} from "../models/workspace.model";
import {
  collectionSchema,
  type CollectionDocType,
} from "../models/collection.model";

import {
  type ActiveSideBarTabDocType,
  activeSideBarTabSchema,
} from "../models/active-sidebar-tab.model";
import { tabSchema, type TabDocType } from "../models/tab.model";
import { addRxPlugin } from "rxdb";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import constants from "@app/constants/constants";
import { teamSchema, type TeamDocType } from "../models/team.model";
import {
  githubRepoSchema,
  type GithubRepoDocType,
} from "../models/github-repo.model";
import {
  environmentSchema,
  type EnvironmentDocType,
} from "../models/environment.model";
import {
  environmentTabSchema,
  type EnvironmentTabDocType,
} from "../models/environment-tab.model";
import {
  windowSettingsSchema,
  type WindowSettingsDocType,
} from "../models/window-settings-model";

import { releaseSchema, type ReleaseDocType } from "../models/release.model";
import { guideSchema, type GuideDocType } from "../models/guide.model";
// import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
// addRxPlugin(RxDBDevModePlugin);
import {
  featureSwitchSchema,
  type FeatureSwitchDocType,
} from "../models/feature-switch.model";
import {
  guestUserSchema,
  type GuestUserDocType,
} from "../models/guest-user.model";
import { updatesSchema, type UpdatesDocType } from "../models/updates.model";
import {
  TestflowSchema,
  type TFRxContainerType,
} from "../models/testflow.model";
// import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
// addRxPlugin(RxDBDevModePlugin);

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBUpdatePlugin);
export type WorkspaceDocument = RxDocument<WorkspaceDocType>;
export type WorkspaceContainer = RxCollection<WorkspaceDocType>;
export type CollectionContainer = RxCollection<CollectionDocType>;
export type CollectionDocument = RxDocument<CollectionDocType>;
export type TeamDocument = RxDocument<TeamDocType>;
export type TeamContainer = RxCollection<TeamDocType>;
export type EnvironmentContainer = RxCollection<EnvironmentDocType>;
export type EnvironmentDocument = RxDocument<EnvironmentDocType>;
export type EnvironmentTabContainer = RxCollection<EnvironmentTabDocType>;
export type EnvironmentTabDocument = RxDocument<EnvironmentTabDocType>;
export type GithubDocument = RxDocument<GithubRepoDocType>;
export type ReleaseDocument = RxDocument<ReleaseDocType>;
export type GuideDocumnet = RxDocument<GuideDocType>;
export type FeatureDocument = RxDocument<FeatureSwitchDocType>;
export type GuestDocument = RxDocument<GuestUserDocType>;
export type UpdatesDocument = RxDocument<UpdatesDocType>;
// collate all the Rx collections

export type TabDocument = RxDocument<TabDocType>;
export type TabContainer = RxCollection<TabDocType>;
export type ActiveSideBarTabDocument = RxDocument<ActiveSideBarTabDocType>;
export type ActiveSideBarTabContainer = RxCollection<ActiveSideBarTabDocType>;
export type WindowSettingsContainer = RxCollection<WindowSettingsDocType>;

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceContainer;
  tab: TabContainer;
  collection: CollectionContainer;
  environment: EnvironmentContainer;
  activesidebartab: ActiveSideBarTabContainer;
  windowSettings: WindowSettingsContainer;
  team: TeamContainer;
  testflow: TFRxContainerType;
};

// define the Rx database type
export type DatabaseType = RxDatabase<DatabaseCollections>;

//RxDB Class
export class RxDB {
  private static instance: RxDB | null = null;
  public rxdb: DatabaseType | null = null;
  private constructor() {}

  public static getInstance(): RxDB {
    if (!RxDB.instance?.rxdb) {
      RxDB.instance = new RxDB();
    }
    return RxDB.instance;
  }

  public async getDb() {
    if (this.rxdb) return { rxdb: this.rxdb };
    // create the Rx database
    this.rxdb = await createRxDatabase<DatabaseCollections>({
      name: constants.RXDB_DB_NAME,
      storage: getRxStorageDexie(),
      ignoreDuplicate: true,
    });

    // add all collections
    await this.rxdb.addCollections({
      workspace: {
        schema: workspaceSchema,
        migrationStrategies: {
          // database  migration functions
          1: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
          2: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
          3: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
          4: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
          5: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
          6: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
          7: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
          8: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
          9: function (oldDoc: WorkspaceDocument) {
            return oldDoc;
          },
        },
      },
      tab: {
        schema: tabSchema,
        migrationStrategies: {
          // database  migration functions
          1: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          2: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          3: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          4: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          5: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          6: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          7: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          8: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          9: function (oldDoc: TabDocument) {
            if (oldDoc?.property?.request?.state) {
              oldDoc.property.request.state.isHeaderBulkEditActive = false;
              oldDoc.property.request.state.isParameterBulkEditActive = false;
            }
            return oldDoc;
          },
          10: function (oldDoc: TabDocument) {
            const ai = {
              conversations: [],
              prompt: "",
              threadId: "",
            };
            if (oldDoc?.property?.request) {
              oldDoc.property.request.ai = ai;
            }
            if (oldDoc?.property?.request?.state) {
              oldDoc.property.request.state.isChatbotActive = false;
              oldDoc.property.request.state.isChatbotSuggestionsActive = true;
              oldDoc.property.request.state.isChatbotGeneratingResponse = false;
              oldDoc.property.request.state.isDocGenerating = false;
              oldDoc.property.request.state.isDocAlreadyGenerated = false;
            }
            return oldDoc;
          },
          11: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          12: function (oldDoc: TabDocument) {
            return oldDoc;
          },
          13: function (oldDoc: TabDocument) {
            return oldDoc;
          },
        },
      },
      collection: {
        schema: collectionSchema,
        migrationStrategies: {
          // database  migration functions
          1: function (oldDoc: CollectionDocument) {
            return oldDoc;
          },
          2: function (oldDoc: CollectionDocument) {
            return oldDoc;
          },
          3: function (oldDoc: CollectionDocument) {
            return oldDoc;
          },
          4: function (oldDoc: CollectionDocument) {
            return oldDoc;
          },
          5: function (oldDoc: CollectionDocument) {
            return oldDoc;
          },
          6: function (oldDoc: CollectionDocument) {
            return oldDoc;
          },
          7: function (oldDoc: CollectionDocument) {
            return oldDoc;
          },
        },
      },
      activesidebartab: {
        schema: activeSideBarTabSchema,
      },
      windowsettings: {
        schema: windowSettingsSchema,
      },
      team: {
        schema: teamSchema,
        migrationStrategies: {
          //   // database  migration functions
          1: function (oldDoc: TeamDocument) {
            return oldDoc;
          },
          2: function (oldDoc: TeamDocument) {
            return oldDoc;
          },
          3: function (oldDoc: TeamDocument) {
            return oldDoc;
          },
        },
      },
      environment: {
        schema: environmentSchema,
        migrationStrategies: {
          //   // database  migration functions
          1: function (oldDoc: EnvironmentDocument) {
            return oldDoc;
          },
          2: function (oldDoc: EnvironmentDocument) {
            return oldDoc;
          },
          3: function (oldDoc: EnvironmentDocument) {
            return oldDoc;
          },
        },
      },
      testflow: {
        schema: TestflowSchema,
      },
      environmenttab: {
        schema: environmentTabSchema,
        migrationStrategies: {
          //   // database  migration functions
          1: function (oldDoc: EnvironmentTabDocument) {
            return oldDoc;
          },
          2: function (oldDoc: EnvironmentTabDocument) {
            return oldDoc;
          },
          3: function (oldDoc: EnvironmentTabDocument) {
            return oldDoc;
          },
        },
      },
      githubrepo: {
        schema: githubRepoSchema,
      },
      releaseupdate: {
        schema: releaseSchema,
      },
      guide: {
        schema: guideSchema,
      },
      featureswitch: {
        schema: featureSwitchSchema,
      },
      guestuser: {
        schema: guestUserSchema,
      },
      updates: {
        schema: updatesSchema,
      },
    });
    return { rxdb: this.rxdb };
  }

  /**
   * Destroys the RXDB Instance from the client
   */
  public async destroyDb(): Promise<void> {
    await this.rxdb?.destroy();
    await this.rxdb?.remove();
    this.rxdb = null;
    return;
  }
}
