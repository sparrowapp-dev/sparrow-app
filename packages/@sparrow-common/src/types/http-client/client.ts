export interface HttpClientResponseInterface<T> {
  status: "success" | "error";
  isSuccessful: boolean;
  message: string;
  data: T;
}
