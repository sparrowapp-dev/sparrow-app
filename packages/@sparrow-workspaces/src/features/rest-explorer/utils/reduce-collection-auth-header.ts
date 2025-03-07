import {
  type KeyValue,
} from "@sparrow/common/types/workspace";
import { CollectionAddToBaseEnum, CollectionAuthTypeBaseEnum, type CollectionAuthBaseInterface } from "@sparrow/common/types/workspace/collection-base";

class ReduceCollectionAuthHeader {
  private authHeader: KeyValue;
  constructor(_state: CollectionAuthTypeBaseEnum, _auth: CollectionAuthBaseInterface) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state === CollectionAuthTypeBaseEnum.BEARER_TOKEN &&
      _auth.bearerToken
    ) {
      authValue.key = "Authorization";
      authValue.value = "Bearer " + _auth.bearerToken;
    } else if (_state === CollectionAuthTypeBaseEnum.BASIC_AUTH) {
      authValue.key = "Authorization";
      authValue.value = `Basic ${btoa(
        _auth.basicAuth.username + ":" + _auth.basicAuth.password,
      )}`;
    } else if (
      _state === CollectionAuthTypeBaseEnum.API_KEY &&
      _auth.apiKey.addTo === CollectionAddToBaseEnum.HEADER &&
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
  public getValue() {
    return this.authHeader;
  }
}

export { ReduceCollectionAuthHeader };
