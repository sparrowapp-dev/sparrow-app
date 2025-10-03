import type { RunConfigurationDTO, NotificationDTO } from "./testflow-dto";

export enum TestflowScheduleNavigatorEnum {
  TEST_RESULTS = "test_results",
  CONFIGURATION = "configuration",
}
export interface TestflowScheduleStateDto {
  scheduleNavigator: TestflowScheduleNavigatorEnum;
}
export interface TestflowScheduleWrapperTabInterface {
  testflowSchedule: {
    scheduleId: string;
    environmentId: string;
    name: string;
    workspaceId: string;
    testflowId: string;
    runConfiguration: RunConfigurationDTO;
    notification: NotificationDTO;
    state: TestflowScheduleStateDto;
  };
}
