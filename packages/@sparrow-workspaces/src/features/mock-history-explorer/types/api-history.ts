import type { RequestMethodEnum } from "@sparrow/common/types/workspace/http-request-mock-tab";

export interface ApiHistoryItem {
  id: string;
  timestamp: string;
  name: string;
  url: string;
  method: RequestMethodEnum;
  responseStatus: string;
  duration: number;
  requestHeaders: KeyValuePair[];
  requestBody?: any;
  responseHeaders?: KeyValuePair[];
  responseBody?: any;
  selectedRequestBodyType?: string;
  selectedResponseBodyType?: string;
}

interface KeyValuePair {
  key: string;
  value: string;
  checked?: boolean;
}

export interface Column {
  key: string;
  label: string;
  sortable: boolean;
  width: string;
}
