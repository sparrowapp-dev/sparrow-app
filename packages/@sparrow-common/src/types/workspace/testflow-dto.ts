export type RunCycle = "once" | "daily" | "weekly" | "hourly";

export interface RunConfigurationDTO {
  runCycle: RunCycle;
  // used only for 'once'
  executeAt?: string;
  // used for daily/weekly (HH:mm)
  time?: string;
  // used for hourly
  intervalHours?: number;
  // weekly: can be numeric (0-6) or capital string names depending on integration
  days?: Array<number | string>;
}

export type ReceiveNotificationType = "failure" | "every_time";

export interface NotificationDTO {
  emails: string[];
  receiveNotifications: ReceiveNotificationType;
}

export interface ScheduleTestFlowRunDto {
  name: string;
  environmentId: string;
  workspaceId: string;
  testflowId: string;
  runConfiguration: RunConfigurationDTO;
  notification?: NotificationDTO;
}
