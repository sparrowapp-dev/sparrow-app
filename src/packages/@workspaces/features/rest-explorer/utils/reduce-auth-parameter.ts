import { AuthSection, AuthType } from "$lib/utils/enums";

class ReduceAuthParameter {
  private authParameter;
  constructor(_state, _auth) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state.requestAuthNavigation === AuthType.API_KEY &&
      _auth.apiKey.addTo === AuthSection.QUERY_PARAMETER &&
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
  public getValue() {
    return this.authParameter;
  }
}

export { ReduceAuthParameter };
