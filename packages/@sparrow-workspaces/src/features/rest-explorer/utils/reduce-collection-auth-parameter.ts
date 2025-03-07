import  {CollectionAddToBaseEnum, type CollectionAuthBaseInterface, CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";

class ReduceCollectionAuthParameter {
  private authParameter;
  constructor(_state: CollectionAuthTypeBaseEnum, _auth: CollectionAuthBaseInterface) {
    const authValue: { key: string; value: string } = {
      key: "",
      value: "",
    };
    if (
      _state === CollectionAuthTypeBaseEnum.API_KEY &&
      _auth.apiKey.addTo === CollectionAddToBaseEnum.QUERY_PARAMETER &&
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

export { ReduceCollectionAuthParameter };
