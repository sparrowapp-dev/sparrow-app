import "./styles/style.scss";
import App from "./App.svelte";
import { RxDB } from "$lib/database/app.database";

async function init() {
  const rxdbInstance = RxDB.getInstance();
  await rxdbInstance.getDb();
  return new App({
    target: document.getElementById("app"),
  });
}

const app = init();
export default app;
