import type { TFHistoryAPIResponseStoreType, TFTabNodesWrapperType } from "./testflow-tab";
import type { TFTabEdgesWrapperType } from "./testflow-tab";

export interface TestFlowScheduleRunViewResultItem
  extends TFTabNodesWrapperType,
    TFTabEdgesWrapperType, TestFlowScheduleRunResultType {};

export interface TestflowScheduleRunViewWrapperTabInterface {
  testflowScheduleRunView: TestFlowScheduleRunViewResultItem;
}

export interface TestFlowScheduleRunResultType {
  result: TestFlowScheduleRunResult;
}

export interface TestflowSchedularHistoryRequest {
  method?: string;
  name?: string;
  status?: string;
  time?: string;
  errorMessage?: string;
  error?: string;
}

export interface TestFlowScheduleRunResult {
  failedRequests: number;
  requests?: TestflowSchedularHistoryRequest[];
  status: string;
  response?:TFHistoryAPIResponseStoreType[];
  successRequests: number;
  totalTime: string;
}