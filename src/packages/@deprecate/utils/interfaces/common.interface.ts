export interface MakeRequestResponse {
  status: "success" | "error";
  isSuccessful: boolean;
  message: string;
  data: any;
}
