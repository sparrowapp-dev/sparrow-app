import { RxDB } from "$lib/database/app.database";

(async () => {
  await RxDB.getInstance().getDb();
})();
