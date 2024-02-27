export interface MakeRequestResponse {
  status: "success" | "error";
  isSuccessful: boolean;
  message: string;
  data: unknown;
  tabId: string;
}
