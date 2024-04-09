import { makeHttpRequestV2 } from "$lib/api/api.common";
import type { Response } from "$lib/utils/interfaces/request.interface";
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

  response = new BehaviorSubject<Response | undefined>(undefined);
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
      const response = await makeHttpRequestV2(
        this.requestUrl,
        this.httpMethod,
      );
      const responseHeaders = response.data.headers;
      const formattedResponse: Response = {
        headers: Object.keys(responseHeaders).map((k) => ({
          key: k,
          value: responseHeaders[k],
          checked: false,
        })),
        body: response.data.body,
      };
      this.response.next(formattedResponse);
    } catch (error) {
      console.error(error);
    }
  };
}

export default RestExplorerViewModel;
