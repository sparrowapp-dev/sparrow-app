import "@app/styles/style.scss";
import App from "./components/App.svelte";
// import { RxDB } from "./database/database";
async function init() {
  // const rxdbInstance = RxDB.getInstance();
  // await rxdbInstance.getDb();
  return new App({
    target: document.getElementById("app") as HTMLInputElement,
  });
}

const app = init();
export default app;
