export interface TeamForm {
  name: {
    value: string;
    isTouched: boolean;
    invalid: boolean;
  };
  description: {
    value: string;
    isTouched: boolean;
    invalid: boolean;
  };
  file: {
    value: File[];
    invalid: boolean;
    showFileTypeError: boolean;
    showFileSizeError: boolean;
  };
}
