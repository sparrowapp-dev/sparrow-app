/**
 * @class - this class makes team data compatible with backend server
 */
export class TeamAdapter {
  private adaptedTeam;
  constructor() {}

  /**
   * Adapts the given team object by mapping and transforming its properties
   * to the adaptedTeam object structure.
   * @param  team - The team object to adapt.
   * @returns  The current instance of the object with the adapted team.
   */
  public adapt(team) {
    const {
      _id,
      name,
      users,
      description,
      logo,
      workspaces,
      owner,
      admins,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      isNewInvite,
    } = team;
    const updatedWorkspaces = workspaces.map((workspace) => ({
      workspaceId: workspace.id,
      name: workspace.name,
    }));
    this.adaptedTeam = {
      teamId: _id,
      name,
      users,
      logo,
      description,
      workspaces: updatedWorkspaces,
      owner,
      admins,
      isActiveTeam: false,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      isNewInvite,
      isOpen: false,
    };
    return this;
  }

  /**
   * Deletes the teamId property from the adaptedTeam object.
   * @returns  The current instance of the object.
   */
  public deleteTeamId = () => {
    delete this.adaptedTeam.teamId;
    return this;
  };

  /**
   * Deletes the isOpen property from the adaptedTeam object.
   * @returns  The current instance of the object.
   */
  public deleteIsOpen = () => {
    delete this.adaptedTeam.isOpen;
    return this;
  };

  /**
   * Deletes the isActiveTeam property from the adaptedTeam object.
   * @returns  The current instance of the object.
   */
  public deleteIsActiveTeam = () => {
    delete this.adaptedTeam.isActiveTeam;
    return this;
  };

  /**
   * Retrieves the adaptedTeam object.
   * @returns  The adaptedTeam object.
   */
  public getValue = () => {
    return this.adaptedTeam;
  };
}
