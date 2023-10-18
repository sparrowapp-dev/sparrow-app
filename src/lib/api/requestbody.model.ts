export interface RequestData {
    data?: {
        [propertyName: string]: unknown;
      },
      headers?: {
        [headerName: string]: string;
      },
}

