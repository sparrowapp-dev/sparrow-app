import { ItemType } from "@sparrow/common/enums";

export interface MockResponseHeaderDto {
  key: string;
  value: string;
}

export interface MockRequestResponseDto {
  responseBody: string;
  responseHeaders: MockResponseHeaderDto[];
  responseStatus: string;
  responseDate: string;
  selectedResponseBodyType: string;
  isMockResponseActive: boolean;
}

export interface MockResponseItemsDto {
  name: string;
  description: string;
  type: ItemType;
  mockRequestResponse: MockRequestResponseDto;
}

export interface HttpResponseMockCreateUpdatePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  mockRequestId: string;
  folderId: string;
  items: MockResponseItemsDto;
}

export interface HttpResponseMockDeletePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  mockRequestId: string;
  folderId?: string;
}