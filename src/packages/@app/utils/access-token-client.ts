import constants from "$lib/utils/constants";
import type { AccessToken } from "@app/types";

export class AccessTokenClient implements AccessToken {
  constructor() {}
  public getValue = () => {
    let token: string | null = "";
    token = localStorage.getItem(constants.AUTH_TOKEN);
    return token;
  };
}
