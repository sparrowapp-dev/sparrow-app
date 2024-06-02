import constants from "$lib/utils/constants";
import type { RefreshToken } from "@app/types";

export class RefreshTokenClient implements RefreshToken {
  constructor() {}
  public getValue = () => {
    let token = null;
    token = localStorage.getItem(constants.REF_TOKEN);
    return token;
  };
}
