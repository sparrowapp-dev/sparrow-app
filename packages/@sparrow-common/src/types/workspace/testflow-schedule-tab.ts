export interface TestflowScheduleStateDto {
}

export interface TestflowScheduleWrapperTabInterface {
  testflowSchedule: {
    scheduleId: string;
    state: TestflowScheduleStateDto;
  };
}
