import { createRxDatabase, type RxCollection, type RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import {
  workspaceSchema,
  type WorkspaceDocType,
} from "$lib/models/workspace.model";

// define all the Rx collections
export type WorkspaceCollection = RxCollection<WorkspaceDocType>;

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceCollection;
};

// define the Rx database type
export type DatabaseType = RxDatabase<DatabaseCollections>;

// create the Rx database
const db: DatabaseType = await createRxDatabase<DatabaseCollections>({
  name: "mydatabase",
  storage: getRxStorageDexie(),
});

// add all collections
const rxdb = await db.addCollections({
  workspace: {
    schema: workspaceSchema,
  },
});

export { rxdb, db };
