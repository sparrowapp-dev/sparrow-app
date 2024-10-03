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
      },
      tab: {
        schema: tabSchema,
      },
      collection: {
        schema: collectionSchema,
      },
      activesidebartab: {
        schema: activeSideBarTabSchema,
      },
      windowsettings: {
        schema: windowSettingsSchema,
      },
      team: {
        schema: teamSchema,
      },
      environment: {
        schema: environmentSchema,
      },
      testflow: {
        schema: TestflowSchema,
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
