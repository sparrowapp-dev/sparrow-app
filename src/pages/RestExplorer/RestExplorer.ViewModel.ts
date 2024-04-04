import { makeHttpRequest } from "$lib/api/api.common";
import { BehaviorSubject } from "rxjs";

class RestExplorerViewModel {
  // dependent properties
  // --------------------
  // this will not directly be exposed but will help
  // in creating the other properties, here this helps
  // in creating `singleProduct` property
  selectedRequest = new BehaviorSubject(0);

  // observable properties
  // ---------------------

  // // directly attached to database
  // get products() {
  //   return dbCollections.products.find().$;
  // };

  _requestUrl = "";

  get requestUrl() {
    return this._requestUrl;
  }
  set requestUrl(value) {
    this._requestUrl = value;
  }

  _httpMethod = "";

  get httpMethod() {
    return this._httpMethod;
  }
  set httpMethod(value) {
    this._httpMethod = value;
  }

  // // attached to database as well as
  // // derived from other properties
  // // here, it is recalculated whenever `selectedProductIndex` changes
  // get singleProduct() {
  //   return this.selectedProductIndex
  //     .pipe(switchMap(id => dbCollections.products.findOne({ selector: { id } }).$));
  // };

  // methods
  // -------
  /**
   * Send the HTTP request
   */
  sendRequest = async () => {
    try {
      const response = await makeHttpRequest(
        this.requestUrl,
        this.httpMethod,
        "",
        `[ { "key": "Connection", "value": "keep-alive" } ]`,
        "",
        "",
      );
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
}

export default RestExplorerViewModel;
