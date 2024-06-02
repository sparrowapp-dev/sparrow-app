interface GetValue {
  getValue(): string | null;
}

export interface AccessToken extends GetValue {}
