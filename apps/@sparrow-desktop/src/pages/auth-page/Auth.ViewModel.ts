import { EnvironmentRepository } from "../../repositories/environment.repository";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import { GuideRepository } from "../../repositories/guide.repository";
import { TeamRepository } from "../../repositories/team.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { InitTab } from "@sparrow/common/factory";
import { v4 as uuidv4 } from "uuid";

export class AuthViewModel {
  constructor() {}
  private guestUserRepository = new GuestUserRepository();
  private teamRepository = new TeamRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private initTab = new InitTab();
  private guideRepository = new GuideRepository();

  /**
   * Insert the guestr user in local DB
   */
  public addGuestUser = async () => {
    await this.guestUserRepository.insert({
      id: uuidv4(),
      name: "guestUser",
      isGuestUser: true,
      isBannerActive: true,
    });
  };

  /**
   *
   * @param data query to find details
   * @returns data from guest user repository
   */
  public findUser = async (data) => {
    const res = await this.guestUserRepository.findOne(data);
    return res;
  };

  /**
   * create dummy team and workspace for guest user
   */
  public createGuestUserTeamWorkspace = async () => {
    const response = await this.findUser({ name: "guestUser" });
    const user = response?.getLatest().toMutableJSON();
    const teamId = uuidv4();
    const workspaceId = uuidv4();
    const dummyTeam = {
      teamId: teamId,
      name: "Team",
      workspaces: [{ name: "My Workspace", workspaceId: workspaceId }],
      users: [{ id: user.id, name: user.name, email: "", role: "owner" }],
      owner: user.id,
      admins: [],
      isActiveTeam: true,
      isOpen: true,
      isNewInvite: false,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };
    await this.teamRepository.createTeam(dummyTeam);
    const dummyWorkspace = {
      _id: workspaceId,
      name: "My Workspace",
      team: {
        teamId: teamId,
        teamName: "Team",
      },
      admins: [{ id: user.id, name: user.name }],
      users: [{ id: user.id, name: user.name, email: "", role: "admin" }],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      isActiveWorkspace: true,
      isNewInvite: false,
      environmentId: "",
      collections: [],
    };
    await this.workspaceRepository.addWorkspace(dummyWorkspace);
    const environmentId = uuidv4();
    const newEnvironment = {
      id: environmentId,
      name: "Global Variables",
      variable: [
        {
          key: "",
          value: "",
          checked: true,
        },
      ],
      isActive: false,
      type: "GLOBAL",
      workspaceId: workspaceId,
      createdAt: new Date().toISOString(),
      createdBy: "username",
      updatedBy: "username",
      updatedAt: "2024-07-16T11:12:55.920Z",
    };

    this.environmentRepository.addEnvironment(newEnvironment);

    this.guideRepository.insert({ isActive: true, id: "environment-guide" });
    this.guideRepository.insert({ isActive: true, id: "collection-guide" });
  };
}
