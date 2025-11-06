// src/types/testflow-dataset.ts
export type DataSetFormatType = "CSV" | "JSON";

export interface TestflowDataSet {
  dataSet: Record<string, any>[];
}

export interface TestflowDataSetItem {
  id: string;
  name: string;
  item: TestflowDataSet;
  formatType: DataSetFormatType;
  fileSize: string;
  fileUrl?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestflowDataSetWrapperTabInterface {
  testflowDataSet: TestflowDataSetItem;
}
