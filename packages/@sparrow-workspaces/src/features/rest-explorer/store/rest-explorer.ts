import { writable } from "svelte/store";
import {
  RequestDataTypeEnum,
  ResponseFormatterEnum,
  ResponseSectionEnum,
} from "@sparrow/common/types/workspace";

export type restExplorerData = {
  abortController: AbortController;
  response: {
    body: string;
    headers: any[];
    status: string;
    time: number;
    size: number;
    navigation: ResponseSectionEnum;
    bodyLanguage: RequestDataTypeEnum;
    bodyFormatter: ResponseFormatterEnum;
    testResults?: any[];
    testMessage?: {
      error: string;
      initiator: "Pre-Request" | "Post-Request";
    }[];
  };
  isSendRequestInProgress: boolean;
};

export const createRestExplorerDataState = (
  overrides: Partial<restExplorerData> = {},
): restExplorerData => ({
  abortController: overrides.abortController ?? new AbortController(),
  response: {
    body: overrides.response?.body ?? "",
    headers: overrides.response?.headers ?? [],
    status: overrides.response?.status ?? "",
    time: overrides.response?.time ?? 0,
    size: overrides.response?.size ?? 0,
    navigation: overrides.response?.navigation ?? ResponseSectionEnum.RESPONSE,
    bodyLanguage: overrides.response?.bodyLanguage ?? RequestDataTypeEnum.TEXT,
    bodyFormatter:
      overrides.response?.bodyFormatter ?? ResponseFormatterEnum.PRETTY,
    testResults: overrides.response?.testResults ?? [],
    testMessage: overrides.response?.testMessage ?? [],
  },
  isSendRequestInProgress: overrides.isSendRequestInProgress ?? false,
});

export const restExplorerDataStore = writable<Map<string, restExplorerData>>(
  new Map(),
);
