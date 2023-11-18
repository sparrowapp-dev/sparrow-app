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

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceCollection;
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
});

export { rxdb, db };
