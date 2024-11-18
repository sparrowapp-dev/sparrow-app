import {
  AuthSectionEnum,
  AuthTypeEnum,
  type Auth,
  type KeyValue,
  type State,
} from "@sparrow/common/types/workspace";

class ReduceAuthHeader {
  private authHeader: KeyValue;
  constructor(_state: State, _auth: Auth) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state.requestAuthNavigation === AuthTypeEnum.BEARER_TOKEN &&
      _auth.bearerToken
    ) {
      authValue.key = "Authorization";
      authValue.value = "Bearer " + _auth.bearerToken;
    } else if (_state.requestAuthNavigation === AuthTypeEnum.BASIC_AUTH) {
      authValue.key = "Authorization";
      authValue.value = `Basic ${btoa(
        _auth.basicAuth.username + ":" + _auth.basicAuth.password,
      )}`;
    } else if (
      _state.requestAuthNavigation === AuthTypeEnum.API_KEY &&
      _auth.apiKey.addTo === AuthSectionEnum.HEADER &&
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
