interface MethodWrapper {
  method: string;
}
interface UrlWrapper {
  url: string;
}
interface BodyWrapper {
  body: unknown;
}
interface HeadersWrapper {
  headers: object;
}

export interface RequestData
  extends MethodWrapper,
    UrlWrapper,
    Partial<BodyWrapper>,
    Partial<HeadersWrapper> {}

interface StatusWrapper {
  status: string;
}
interface IsSuccessfulWrapper {
  isSuccessful: boolean;
}
interface DataWrapper {
  data: any;
}

export interface ResponseData
  extends StatusWrapper,
    IsSuccessfulWrapper,
    DataWrapper {}

export interface MakeRequest {
  makeRequest(requestData: RequestData): Promise<ResponseData>;
}

export interface HttpClient extends MakeRequest {}
