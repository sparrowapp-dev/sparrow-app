import { RxDB } from "$lib/database/app.database";

(async () => {
  console.log("I AM THE DB INITIALIZER");
  await RxDB.getInstance().getDb();
  console.log("rxdb===> ", RxDB.getInstance().rxdb);
  console.log("db =====> ", RxDB.getInstance().db);
})();
