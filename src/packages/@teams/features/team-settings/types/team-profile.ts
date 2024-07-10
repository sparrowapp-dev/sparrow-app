export enum TeamPropertyEnum {
  IMAGE = "image",
  NAME = "name",
  DESCRIPTION = "description",
}

export interface UpdateTeamIcon {
  file: {
    value: File[];
    invalid: boolean;
    showFileSizeError: boolean;
    showFileTypeError: boolean;
  };
}
