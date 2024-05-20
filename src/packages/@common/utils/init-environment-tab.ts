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
      environmentId: uuidv4(),
      name: "New Environment",
      description: "",
      variable: [
        {
          key: "",
          value: "",
          checked: true,
        },
      ],
      isActive: false,
      type: "LOCAL",
      isSave: true,
      isSaveInProgress: false,
      workspaceId: _workspaceId,
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
  public setEnvironmentId(_id: string) {
    this._tab.environmentId = _id;
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
    this._tab.variable = _variable;
    return this;
  }

  public setIsSave(_isSave: boolean) {
    this._tab.isSave = _isSave;
    return this;
  }

  public setIsActive(_isActive: boolean) {
    this._tab.isActive = _isActive;
    return this;
  }

  public setType(_type: string) {
    this._tab.type = _type;
    return this;
  }
}

export { InitEnvironmentTab };
