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
  workspaceDocMethods,
  type WorkspaceCollectionMethods,
  type WorkspaceDocMethods,
  workspaceCollectionMethods,
} from "$lib/repositories/workspace.repository";
import { tabSchema, type TabDocType } from "$lib/models/tab.model";
import {
  tabDocMethods,
  type TabCollectionMethods,
  type TabDocMethods,
  tabCollectionMethods,
} from "$lib/repositories/tab.repository";
// define all the Rx collections
export type WorkspaceDocument = RxDocument<
  WorkspaceDocType,
  WorkspaceDocMethods
>;
export type WorkspaceCollection = RxCollection<
  WorkspaceDocType,
  WorkspaceDocMethods,
  WorkspaceCollectionMethods
>;
export type TabDocument = RxDocument<TabDocType, TabDocMethods>;
export type TabCollection = RxCollection<
  TabDocType,
  TabDocMethods,
  TabCollectionMethods
>;

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceCollection;
  tab: TabCollection;
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
    methods: workspaceDocMethods,
    statics: workspaceCollectionMethods,
  },
  tab: {
    schema: tabSchema,
    methods: tabDocMethods,
    statics: tabCollectionMethods,
  },
});

export { rxdb, db };
