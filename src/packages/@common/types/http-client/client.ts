export interface HttpCResponseType {
  status: "success" | "error";
  isSuccessful: boolean;
  message: string;
  data: any;
}
