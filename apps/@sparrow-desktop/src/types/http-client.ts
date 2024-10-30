export interface HttpClientResponseInterface<T> {
  status: "success" | "error";
  isSuccessful: boolean;
  message: string;
  data: T;
}

export interface HttpClientBackendResponseInterface<T> {
  data: T;
  message: string;
  statusCode: number;
}
