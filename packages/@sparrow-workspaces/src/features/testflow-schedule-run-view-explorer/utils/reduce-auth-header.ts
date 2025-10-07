import {
  type KeyValue,
} from "@sparrow/common/types/workspace";
import { CollectionRequestAddToBaseEnum, type CollectionAuthBaseInterface, type CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
import { HttpRequestAuthTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";

class ReduceAuthHeader {
  private authHeader: KeyValue;
  constructor(_state: HttpRequestAuthTypeBaseEnum | CollectionAuthTypeBaseEnum, _auth: CollectionAuthBaseInterface) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state === HttpRequestAuthTypeBaseEnum.BEARER_TOKEN &&
      _auth.bearerToken
    ) {
      authValue.key = "Authorization";
      authValue.value = "Bearer " + _auth.bearerToken;
    } else if (_state === HttpRequestAuthTypeBaseEnum.BASIC_AUTH) {
      authValue.key = "Authorization";
      authValue.value = `Basic ${btoa(
        _auth.basicAuth.username + ":" + _auth.basicAuth.password,
      )}`;
    } else if (
      _state === HttpRequestAuthTypeBaseEnum.API_KEY &&
      _auth.apiKey.addTo === CollectionRequestAddToBaseEnum.HEADER &&
      (_auth.apiKey.authKey || _auth.apiKey.authValue)
    ) {
      authValue.key = _auth.apiKey.authKey;
      authValue.value = _auth.apiKey.authValue;
    } else {
      authValue.key = "";
      authValue.value = "";
    }
    this.authHeader = authValue;
  }
  public getValue() : KeyValue {
    return this.authHeader;
  }
}

export { ReduceAuthHeader };
