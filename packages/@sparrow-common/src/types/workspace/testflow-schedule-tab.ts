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
    state: TestflowScheduleStateDto;
  };
}
