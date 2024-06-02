import type { GetBearerToken } from "@app/types";

export class BearerTokenClient implements GetBearerToken {
  constructor() {}
  public getBearerToken = (token: string) => {
    return {
      Authorization: `Bearer ${token}`,
    };
  };
}
