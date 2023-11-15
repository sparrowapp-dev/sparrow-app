import {
  createRxDatabase,
  // addRxPlugin,
  type RxCollection,
  type RxDatabase,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
// import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import {
  workspaceSchema,
  type ProductDocType,
} from "../models/workspace.model";
// addRxPlugin(RxDBDevModePlugin);
// define all the Rx collections
export type ProductCollection = RxCollection<ProductDocType>;

// collate all the Rx collections
export type DatabaseCollections = {
  products: ProductCollection;
};

// define the Rx database type
export type DatabaseType = RxDatabase<DatabaseCollections>;

// create the Rx database
const db: DatabaseType = await createRxDatabase<DatabaseCollections>({
  name: "mydatabase",
  storage: getRxStorageDexie(),
});

// add all collections
await db.addCollections({
  workspace: {
    schema: workspaceSchema,
  },
});

export const dbCollections = db.collections;
