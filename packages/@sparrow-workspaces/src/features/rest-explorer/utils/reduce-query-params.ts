import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";

class ReduceQueryParams {
  private queryParam = "";
  constructor(params: KeyValuePair[]) {
    let queryString: string = "";
    let count: number = 0;
    for (const param of params) {
      if (param?.checked) {
        count++;
        queryString += `${param.key}=${param.value}&`;
      }
    }
    if (count !== 0) {
      queryString = queryString.slice(0, -1);
    }
    this.queryParam = queryString;
  }
  public getValue() {
    return this.queryParam;
  }
}

export { ReduceQueryParams };
