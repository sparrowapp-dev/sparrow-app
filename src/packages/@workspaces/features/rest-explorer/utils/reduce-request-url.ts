import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";

class ReduceRequestURL {
  private queryParams: KeyValuePair[];
  private requestHost;
  private extractURL(url: string) {
    let response = "";
    for (let i = 0; i < url.length; i++) {
      if (url[i] === "?") {
        break;
      }
      response += url[i];
    }
    return response;
  }

  private extractQueryParams(url: string) {
    let queryString: string = "";
    let flag: boolean = false;

    for (let i = 0; i < url.length; i++) {
      if (flag) {
        queryString += url[i];
      }
      if (url[i] === "?") {
        flag = true;
      }
    }

    if (queryString === "") {
      return [{ key: "", value: "", checked: false }];
    } else {
      const paramsArray = queryString.split("&");
      const params = paramsArray.map((param) => {
        const keyValue = param.split("=");
        if (keyValue.length === 1) {
          return { key: keyValue[0], value: "", checked: true };
        } else if (keyValue.length === 2) {
          return { key: keyValue[0], value: keyValue[1], checked: true };
        }
      });

      return [...params, { key: "", value: "", checked: false }];
    }
  }
  constructor(url: string) {
    this.requestHost = this.extractURL(url);
    this.queryParams = this.extractQueryParams(url);
  }
  public getHost() {
    return this.requestHost;
  }
  public getQueryParameters() {
    return this.queryParams;
  }
}

export { ReduceRequestURL };
