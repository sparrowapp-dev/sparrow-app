import { type Auth, type KeyValue } from "@sparrow/common/types/workspace";
import {
  GraphqlRequestAuthTypeTabEnum,
  type GraphqlRequestStateTabInterface,
} from "@sparrow/common/types/workspace/graphql-request-tab";

class ReduceAuthHeader {
  private authHeader: KeyValue;
  constructor(_state: GraphqlRequestStateTabInterface, _auth: Auth) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state.requestAuthNavigation ===
        GraphqlRequestAuthTypeTabEnum.BEARER_TOKEN &&
      _auth.bearerToken
    ) {
      authValue.key = "Authorization";
      authValue.value = "Bearer " + _auth.bearerToken;
    } else if (
      _state.requestAuthNavigation === GraphqlRequestAuthTypeTabEnum.BASIC_AUTH
    ) {
      authValue.key = "Authorization";
      authValue.value = `Basic ${btoa(
        _auth.basicAuth.username + ":" + _auth.basicAuth.password,
      )}`;
    } else if (
      _state.requestAuthNavigation === GraphqlRequestAuthTypeTabEnum.API_KEY &&
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

export { ReduceAuthHeader };
