interface GetValue {
  getValue(): string | null;
}

export interface RefreshToken extends GetValue {}
