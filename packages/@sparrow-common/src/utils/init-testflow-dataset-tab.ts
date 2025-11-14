import {
  TabTypeEnum,
  type Tab,
  type Path,
  TabPersistenceTypeEnum,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";
import type { DataSetFormatType } from "../types/workspace/testflow-dateset-tab";

/**
 * @class InitTestflowDataSetTab
 * Represents a tab configuration for viewing or editing Testflow Dataset details.
 */
class InitTestflowDataSetTab {
  private _tab: Tab;

  /**
   *
   * @param _id - Mongo ID for the dataset
   * @param _workspaceId - Associated workspace ID
   */
  constructor(_id: string, _workspaceId: string, _testflowId?: string) {
    this._tab = {
      id: _id,
      label: "",
      tabId: uuidv4(),
      name: "New Dataset",
      type: TabTypeEnum.TESTFLOW_DATASET,
      persistence: TabPersistenceTypeEnum.TEMPORARY,
      description: "",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        testflowDataSet: {
          name: "",
          item: {
            dataSet: [],
          },
          formatType: "" as DataSetFormatType,
          fileSize: "",
          fileUrl: "",
          createdBy: "",
          updatedBy: "",
          createdAt: "",
          updatedAt: "",
        },
      },
      path: {
        workspaceId: _workspaceId,
        collectionId: "",
        folderId: "",
        testflowId: _testflowId,
      },
      isSaved: true,
      index: 0,
      isActive: true,
      timestamp: new Date().toString(),
    };

    if (!_id || !_workspaceId) {
      console.error("Invalid dataset ID or workspace ID on tab creation!");
    }
  }

  /** Returns the tab object */
  public getValue(): Tab {
    return this._tab;
  }

  /** Update dataset ID */
  public updateId(_id: string) {
    this._tab.id = _id;
    if (this._tab.property.testflowDataSet) {
      this._tab.property.testflowDataSet.id = _id;
    }
    return this;
  }

  /** Update tab persistence (TEMPORARY or PERSISTENT) */
  public updateTabType(type: TabPersistenceTypeEnum) {
    this._tab.persistence = type;
    return this;
  }

  /** Update tab name */
  public updateName(_name: string) {
    this._tab.name = _name;
    if (this._tab.property.testflowDataSet) {
      this._tab.property.testflowDataSet.name = _name;
    }
    return this;
  }

  /** Update description */
  public updateDescription(_description: string) {
    this._tab.description = _description;
    return this;
  }

  /** Update path (workspace, folder, etc.) */
  public updatePath(_path: Path) {
    this._tab.path = {
      ...this._tab.path,
      ..._path,
    };
    return this;
  }

  /** Update dataset item (dataSet array) */
  public updateDataSet(_dataSet: { dataSet: Record<string, any>[] }) {
    if (this._tab.property.testflowDataSet?.item) {
      this._tab.property.testflowDataSet.item = _dataSet;
    }
    return this;
  }

  /** Update format type (CSV / JSON) */
  public updateFormatType(_formatType: DataSetFormatType) {
    if (this._tab.property.testflowDataSet) {
      this._tab.property.testflowDataSet.formatType = _formatType;
    }
    return this;
  }

  /** Update file metadata */
  public updateFileDetails({
    fileSize,
    fileUrl,
    updatedBy,
  }: {
    fileSize?: string;
    fileUrl?: string;
    updatedBy?: string;
  }) {
    const ds = this._tab.property.testflowDataSet;
    if (ds) {
      if (fileSize) ds.fileSize = fileSize;
      if (fileUrl) ds.fileUrl = fileUrl;
      if (updatedBy) ds.updatedBy = updatedBy;
    }
    return this;
  }

  public updateUpdatedAt(_updatedAt: string) {
    if (this._tab.property.testflowDataSet) {
      this._tab.property.testflowDataSet.updatedAt = _updatedAt;
    }
    return this;
  }

  /** Update timestamps manually if needed */
  public updateTimestamps(createdAt?: string, updatedAt?: string) {
    const ds = this._tab.property.testflowDataSet;
    if (ds) {
      if (createdAt) ds.createdAt = createdAt;
      if (updatedAt) ds.updatedAt = updatedAt;
    }
    return this;
  }
}

export { InitTestflowDataSetTab };
