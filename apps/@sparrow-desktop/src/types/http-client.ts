export interface MakeRequestResponse<T> {
  status: "success" | "error";
  isSuccessful: boolean;
  message: string;
  data: T;
}
