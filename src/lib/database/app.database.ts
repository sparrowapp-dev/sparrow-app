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
} from "$lib/models/workspace.model";
import {
  collectionSchema,
  type CollectionDocType,
} from "$lib/models/collection.model";

import {
  type ActiveSideBarTabDocType,
  activeSideBarTabSchema,
} from "$lib/models/active-sidebar-tab.model";
import { tabSchema, type TabDocType } from "$lib/models/tab.model";
import { addRxPlugin } from "rxdb";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBUpdatePlugin);

export type WorkspaceDocument = RxDocument<WorkspaceDocType>;
export type WorkspaceContainer = RxCollection<WorkspaceDocType>;
export type CollectionContainer = RxCollection<CollectionDocType>;
export type CollectionDocument = RxDocument<CollectionDocType>;
// collate all the Rx collections

export type TabDocument = RxDocument<TabDocType>;
export type TabContainer = RxCollection<TabDocType>;
export type ActiveSideBarTabDocument = RxDocument<ActiveSideBarTabDocType>;
export type ActiveSideBarTabContainer = RxCollection<ActiveSideBarTabDocType>;

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceContainer;
  tab: TabContainer;
  collection: CollectionContainer;
  activeSideBarTab: ActiveSideBarTabContainer;
};

// define the Rx database type
export type DatabaseType = RxDatabase<DatabaseCollections>;

// create the Rx database
const rxdb: DatabaseType = await createRxDatabase<DatabaseCollections>({
  name: "mydatabase",
  storage: getRxStorageDexie(),
});

// add all collections
const db = await rxdb.addCollections({
  workspace: {
    schema: workspaceSchema,
    migrationStrategies: {
      // data migration from version 0 to version 1
      1: function (oldDoc) {
        return oldDoc;
      },
      2: function (oldDoc) {
        return oldDoc;
      },
    },
  },
  tab: {
    schema: tabSchema,
    migrationStrategies: {
      // database  migration functions
      1: function (oldDoc) {
        return oldDoc;
      },
      2: function (oldDoc) {
        return oldDoc;
      },
      3: function (oldDoc) {
        oldDoc.tabId = oldDoc.id;
        oldDoc.saveInProgress = false;
        return oldDoc;
      },
      4: function (oldDoc) {
        oldDoc.tabId = oldDoc.id;
        oldDoc.saveInProgress = false;
        return oldDoc;
      },
    },
  },
  collection: {
    schema: collectionSchema,
    migrationStrategies: {
      // data migration from version 0 to version 1
      1: function (oldDoc) {
        return oldDoc;
      },
      2: function (oldDoc) {
        return oldDoc;
      },
      3: function (oldDoc) {
        oldDoc.collectionId = oldDoc._id;
        return oldDoc;
      },
    },
  },
  activeSideBarTab: {
    schema: activeSideBarTabSchema,
    migrationStrategies: {
      // data migration from version 0 to version 1
      1: function (oldDoc) {
        return oldDoc;
      },
      2: function (oldDoc) {
        return oldDoc;
      },
      3: function (oldDoc) {
        return oldDoc;
      },
      4: function (oldDoc) {
        return oldDoc;
      },
    },
  },
});

export { rxdb, db };
