import type {
  TFTabEdgesWrapperType,
  TFTabNodesWrapperType,
} from "./testflow-tab";

export enum TestflowScheduleRunNavigatorEnum {
  TEST_RESULTS = "test_results",
  CONFIGURATION = "configuration",
}

export enum TFScheduleRunDefaultEnum {
  NAME = "Default Schedule Run",
}

export interface TFScheduleRunTabItemType {
  scheduleId: string;
  scheduleName: string;
  testflowId: string;
  testflowName:string;
  state: TestflowScheduleRunStateDto;
  testresult: TestFlowScheduleRunResultItem[];
}

export interface TFScheduleRunId {
  id: string;
}

export interface TestFlowScheduleRunResultItem
  extends TFScheduleRunId,
    TFTabNodesWrapperType,
    TFTabEdgesWrapperType {
  result: TestFlowScheduleRunResult;
}

export interface TestflowScheduleRunWrapperTabInterface {
  testflowScheduleRun: TFScheduleRunTabItemType;
}

export interface TFScheduleRunTabItemType {}

export interface TestFlowScheduleRunHistory {
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
  successRequests: number;
  totalTime: string;
}

export interface TestflowScheduleRunStateDto {
  scheduleNavigator: TestflowScheduleRunNavigatorEnum;
}

export interface TestflowScheduleRunStates {
  state: TestflowScheduleRunStateDto;
}
