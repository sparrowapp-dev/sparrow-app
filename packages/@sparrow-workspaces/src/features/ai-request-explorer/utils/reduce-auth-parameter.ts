import type { KeyValue } from "@sparrow/common/types/workspace";
import { CollectionRequestAddToBaseEnum, type CollectionAuthBaseInterface, type CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
import {  HttpRequestAuthTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";

class ReduceAuthParameter {
  private authParameter : KeyValue;
  constructor(_state: HttpRequestAuthTypeBaseEnum | CollectionAuthTypeBaseEnum, _auth: CollectionAuthBaseInterface) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state === HttpRequestAuthTypeBaseEnum.API_KEY &&
      _auth.apiKey.addTo === CollectionRequestAddToBaseEnum.QUERY_PARAMETER &&
      (_auth.apiKey.authKey || _auth.apiKey.authValue)
    ) {
      authValue.key = _auth.apiKey.authKey;
      authValue.value = _auth.apiKey.authValue;
    } else {
      authValue.key = "";
      authValue.value = "";
    }
    this.authParameter = authValue;
  }
  public getValue() : KeyValue {
    return this.authParameter;
  }
}

export { ReduceAuthParameter };
