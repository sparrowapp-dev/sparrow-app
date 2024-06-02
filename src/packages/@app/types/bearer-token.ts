export interface GetBearerToken {
  getBearerToken(token: string | null): {
    Authorization: string;
  };
}

export interface BearerToken extends GetBearerToken {}
