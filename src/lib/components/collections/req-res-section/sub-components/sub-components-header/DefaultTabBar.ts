import { rxdb } from "$lib/database/main.database";
// import productsService from "../../lib/services/products.service";

class MvvmDemoViewModel {
  // constant properties
  // -------------------
  get title() {
    return "MVVM Demo";
  }

  get description() {
    return "This is a demo of the MVVM pattern in Tauri + Svelte.";
  }

  // directly attached to database
  get products() {
    return rxdb.workspace.find().$;
  }

  refreshProducts = async () => {
    const data = [
      {
        _id: "1",
        name: "asif",
      },
      { _id: "2", name: "raza" },
      {
        _id: "3",
        name: "taman",
      },
    ];
    // fetch latest products list from api
    // const data = await getProducts();

    // update the database
    await rxdb.workspace.bulkInsert(data);
  };
}

export default MvvmDemoViewModel;
