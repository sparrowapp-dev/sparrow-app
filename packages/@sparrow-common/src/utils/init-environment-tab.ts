import {
  TabPersistenceTypeEnum,
  TabTypeEnum,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";

class InitEnvironmentTab {
  private _tab;
  /**
   *
   * @param _id - Environment mongo id
   * @param _workspaceId - Workspace mongo id to which Environment belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      tabId: uuidv4(),
      name: "New Environment",
      type: TabTypeEnum.ENVIRONMENT,
      persistence: TabPersistenceTypeEnum.PERMANENT,
      description: "",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        environment: {
          variable: [
            {
              key: "",
              value: "",
              checked: true,
            },
          ],
          type: "LOCAL",
          state: {
            isSaveInProgress: false,
          },
          aiVariable: [],
        },
      },
      path: {
        workspaceId: _workspaceId,
        collectionId: "",
        folderId: "",
      },
      generateVariable: false,
      generateProperty: {
        collectionId: "",
        collectionName: "",
      },
      isGenerateVariableAccepted: false,
      isGenerateVariableEmpty: false,
      isGenerateVariableLoading: false,
      isGenerateVariableRejected: false,
      isSaved: true,
      index: 0,
      isActive: true,
      timestamp: new Date().toString(),
    };
    if (!_id || !_workspaceId) {
      console.error(
        "invalid id or workspace id on create new tab environment!",
      );
    }
  }
  public getValue() {
    return this._tab;
  }
  public setId(_id: string) {
    this._tab.id = _id;
    return this;
  }
  public setTabType(type: TabPersistenceTypeEnum) {
    this._tab.persistence = type;
  }
  public setEnvironmentId(_id: string) {
    this._tab.id = _id;
    return this;
  }
  public setName(_name: string) {
    this._tab.name = _name;
    return this;
  }
  public setDescription(_description: string) {
    this._tab.description = _description;
    return this;
  }
  public setVariable(_variable) {
    this._tab.property.environment.variable = _variable;
    return this;
  }
  public setAiVariable(_variable) {
    this._tab.property.environment.aiVariable = _variable;
  }

  public setType(_type: string) {
    this._tab.property.environment.type = _type;
    return this;
  }
  public setGenerativeVariables(_genertiveVariable: boolean) {
    this._tab.generateVariable = _genertiveVariable;
    return this;
  }
  public setGenerativeProperties(
    _generatingCollectionId: string,
    _generatingCollectionName: string,
  ) {
    this._tab.generateProperty.collectionId = _generatingCollectionId;
    this._tab.generateProperty.collectionName = _generatingCollectionName;
    return this;
  }
  public setGenerateVariableAccepted(_type: boolean) {
    this._tab.isGenerateVariableAccepted = _type;
    return this;
  }
  public setGenerateVariableEmpty(_type: boolean) {
    this._tab.isGenerateVariableEmpty = _type;
    return this;
  }
  public setGenerateVariableLoading(_type: boolean) {
    this._tab.isGenerateVariableLoading = _type;
    return this;
  }
  public setGenerateVariableRejected(_type: boolean) {
    this._tab.isGenerateVariableRejected = _type;
    return this;
  }
}

export { InitEnvironmentTab };
