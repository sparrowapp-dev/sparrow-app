import type { KeyValueChecked } from "@sparrow/common/types/workspace";

class ReduceRequestURL {
  private queryParams: KeyValueChecked[];
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
      const params: KeyValueChecked[] = paramsArray.map((param) => {
        const keyValue = param.split("=");
        if (keyValue.length === 1) {
          return { key: keyValue[0] || "", value: "", checked: true };
        } else if (keyValue.length === 2) {
          return {
            key: keyValue[0] || "",
            value: keyValue[1] || "",
            checked: true,
          };
        } else {
          return { key: "", value: "", checked: true };
        }
      });
      const response: KeyValueChecked[] = [
        ...params,
        { key: "", value: "", checked: false },
      ];
      return response;
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
