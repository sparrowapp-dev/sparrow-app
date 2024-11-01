export interface HttpClientResponseInterface {
  status: "success" | "error";
  isSuccessful: boolean;
  message: string;
  data: any;
}
