import { AuthSection, AuthType } from "$lib/utils/enums";

class ReduceAuthHeader {
  private authHeader;
  constructor(_state, _auth) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state.requestAuthNavigation === AuthType.BEARER_TOKEN &&
      _auth.bearerToken
    ) {
      authValue.key = "Authorization";
      authValue.value = "Bearer " + _auth.bearerToken;
    } else if (_state.requestAuthNavigation === AuthType.BASIC_AUTH) {
      authValue.key = "Authorization";
      authValue.value = `Basic ${btoa(
        _auth.basicAuth.username + ":" + _auth.basicAuth.password,
      )}`;
    } else if (
      _state.requestAuthNavigation === AuthType.API_KEY &&
      _auth.apiKey.addTo === AuthSection.HEADER &&
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
