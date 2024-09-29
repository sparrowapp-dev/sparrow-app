import {
  AuthSectionEnum,
  AuthTypeEnum,
  type Auth,
  type State,
} from "@sparrow/common/types/workspace";

class ReduceAuthParameter {
  private authParameter;
  constructor(_state: State, _auth: Auth) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state.requestAuthNavigation === AuthTypeEnum.API_KEY &&
      _auth.apiKey.addTo === AuthSectionEnum.QUERY_PARAMETER &&
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
