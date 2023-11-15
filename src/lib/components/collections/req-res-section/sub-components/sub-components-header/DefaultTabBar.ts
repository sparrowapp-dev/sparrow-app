import { dbCollections } from "$lib/database/main.database";
// import productsService from "../../lib/services/products.service";

const getProducts = async () => {
  const response = await fetch("https://dummyjson.com/products");
  const products = await response.json();
  return products;
};

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
    return dbCollections.products.find().$;
  }

  refreshProducts = async () => {
    // fetch latest products list from api
    const data = await getProducts();

    // update the database
    await dbCollections.products.bulkInsert(data.products);
  };
}

export default MvvmDemoViewModel;
