// import { WorkspaceService } from "../../services/workspace.service";
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { WorkspaceRepository } from "../../repositories/workspace.repository";
// import {
//   requestResponseStore,
//   tabs,
// } from "@app/store/auth.store/request-response-section";
// import { TabRepository } from "../../repositories/tab.repository";
// import { CollectionRepository } from "../../repositories/collection.repository";
// import { TeamService } from "../../services/team.service";
// import { TeamRepository } from "../../repositories/team.repository";
// import type { TeamDocument } from "../../database/database";
// import type { Observable } from "rxjs";
// import type { InviteBody } from "@deprecate/utils/dto/team-dto";
// import type { TeamRole, WorkspaceRole } from "@deprecate/utils/enums";
// import { UserService } from "../../services/user.service";
// import type { MakeRequestResponse } from "@deprecate/utils/interfaces/common.interface";
// import type { Team } from "@deprecate/utils/interfaces";

// export class TeamViewModel {
//   constructor() {}
//   private workspaceRepository = new WorkspaceRepository();
//   private tabRepository = new TabRepository();
//   private collectionRepository = new CollectionRepository();
//   private workspaceService = new WorkspaceService();
//   private teamService = new TeamService();
//   private teamRepository = new TeamRepository();
//   private userService = new UserService();

//   public debounce = (func, delay) => {
//     let timerId;

//     return function (...args) {
//       /* eslint-disable @typescript-eslint/no-this-alias */
//       const context = this;

//       clearTimeout(timerId);
//       timerId = setTimeout(() => {
//         func.apply(context, args);
//       }, delay);
//     };
//   };

//   public syncTabWithStore = () => {
//     this.tabRepository.syncTabsWithStore(tabs);
//   };

//   debouncedTab = this.debounce(this.syncTabWithStore, 2000);

//   get tabs() {
//     return requestResponseStore.getTabList();
//   }

//   public get collection() {
//     return this.collectionRepository.getCollection();
//   }

//   public get workspaces() {
//     return this.workspaceRepository.getWorkspaces();
//   }

//   public get teams() {
//     return this.teamRepository.getTeams();
//   }

//   public get activeTeam() {
//     return this.teamRepository.getActiveTeam();
//   }

//   public get openTeam() {
//     return this.teamRepository.getOpenTeam();
//   }

//   public get activeWorkspace() {
//     return this.workspaceRepository.getActiveWorkspace();
//   }

//   /**
//    * Get team By it's ID
//    * @param teamId
//    * @returns RxDoc (Observable) of the team with that ID
//    */
//   public getTeam = async (
//     teamId: string,
//   ): Promise<Observable<TeamDocument>> => {
//     return await this.teamRepository.getTeam(teamId);
//   };

//   /**
//    * Leave team from RxDB
//    * @param teamId
//    * @returns Left Team Success or Failure
//    */
//   public leaveTeam = async (teamId: string): Promise<any> => {
//     return await this.teamService.leaveTeam(teamId);
//   };

//   public removeTeam = async (teamId: string) => {
//     return await this.teamRepository.removeTeam(teamId);
//   };

//   public activateInitialWorkspace = async () => {
//     await this.workspaceRepository.activateInitialWorkspace();
//   };

//   public checkActiveTeam = async (teamId: string): Promise<boolean> => {
//     return await this.teamRepository.checkActiveTeam(teamId);
//   };

//   public activateTeam = (teamId: string): void => {
//     this.teamRepository.setActiveTeam(teamId);
//     return;
//   };

//   public addTeam = async (team) => {
//     await this.teamRepository.createTeam(team);
//   };
//   public modifyTeam = async (teamId, team) => {
//     await this.teamRepository.modifyTeam(teamId, team);
//   };

//   public updateUserRoleInTeam = async (
//     teamId: string,
//     userId: string,
//     role: TeamRole,
//   ) => {
//     await this.teamRepository.updateUserRoleInTeam(teamId, userId, role);
//     return;
//   };
//   public removeUserFromTeam = async (teamId: string, userId: string) => {
//     await this.teamRepository.removeUserFromTeam(teamId, userId);
//     return;
//   };
//   public createTeam = async (team) => {
//     const response = await this.teamService.createTeam(team);
//     return response;
//   };

//   public activateInitialTeamWorkspace = async (): Promise<void> => {
//     const workspaceIdToActivate =
//       await this.teamRepository.activateInitialTeamWithWorkspace();
//     if (workspaceIdToActivate)
//       await this.workspaceRepository.setActiveWorkspace(workspaceIdToActivate);
//     return;
//   };

//   public getTeamDocument = (elem: TeamDocument) => {
//     return {
//       teamId: elem.get("teamId"),
//       name: elem.get("name"),
//       logo: elem.get("logo"),
//       workspaces: elem.get("workspaces"),
//       users: elem.get("users"),
//       owner: elem.get("owner"),
//       admins: elem.get("admins"),
//       isActiveTeam: elem.get("isActiveTeam"),
//       createdAt: elem.get("createdAt"),
//       createdBy: elem.get("createdBy"),
//       updatedAt: elem.get("updatedAt"),
//       updatedBy: elem.get("updatedBy"),
//       isNewInvite: elem.get("isNewInvite"),
//     };
//   };

//   public handleCreateTab = (data) => {
//     requestResponseStore.createTab(data);
//     this.debouncedTab();
//   };

//   public addWorkspace = async (workspace) => {
//     await this.workspaceRepository.addWorkspace(workspace);
//   };

//   public updateWorkspace = async (id, data) => {
//     await this.workspaceRepository.updateWorkspace(id, data);
//   };

//   public createWorkspace = async (workspace) => {
//     const response = await this.workspaceService.createWorkspace(workspace);
//     return response;
//   };
//   public getTeamData = async () => {
//     return await this.teamRepository.getTeamData();
//   };

//   public addWorkspaceInTeam = (teamId, workspaceId, name) => {
//     this.teamRepository.addWorkspaceInTeam(teamId, workspaceId, name);
//   };
//   // sync teams data with backend server
//   public refreshTeams = async (userId: string): Promise<void> => {
//     let openTeamId: string = "";
//     const teamsData = await this.getTeamData();
//     teamsData.forEach((element) => {
//       const elem = element.toMutableJSON();
//       if (elem.isOpen) openTeamId = elem.teamId;
//     });
//     const response = await this.teamService.fetchTeams(userId);
//     if (response?.isSuccessful && response?.data?.data) {
//       const data = response.data.data.map((elem) => {
//         const {
//           _id,
//           name,
//           users,
//           description,
//           logo,
//           workspaces,
//           owner,
//           admins,
//           createdAt,
//           createdBy,
//           updatedAt,
//           updatedBy,
//           isNewInvite,
//         } = elem;
//         const updatedWorkspaces = workspaces.map((workspace) => ({
//           workspaceId: workspace.id,
//           name: workspace.name,
//         }));
//         return {
//           teamId: _id,
//           name,
//           users,
//           logo,
//           description,
//           workspaces: updatedWorkspaces,
//           owner,
//           admins,
//           isActiveTeam: false,
//           createdAt,
//           createdBy,
//           updatedAt,
//           updatedBy,
//           isNewInvite,
//         };
//       });
//       if (openTeamId) {
//         data.forEach((elem) => {
//           if (elem.teamId === openTeamId) {
//             elem.isOpen = true;
//           } else {
//             elem.isOpen = false;
//           }
//         });
//       } else {
//         data[0].isOpen = true;
//       }

//       await this.teamRepository.bulkInsertData(data);
//     }
//   };

//   // service
//   public inviteMembersAtTeam = async (
//     teamId: string,
//     inviteBody: InviteBody,
//   ) => {
//     const response = await this.teamService.inviteMembersAtTeam(
//       teamId,
//       inviteBody,
//     );
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//     return;
//   };

//   public removeMembersAtTeam = async (teamId: string, userId: string) => {
//     const response = await this.teamService.removeMembersAtTeam(teamId, userId);
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//     return response;
//   };

//   public promoteToAdminAtTeam = async (teamId: string, userId: string) => {
//     const response = await this.teamService.promoteToAdminAtTeam(
//       teamId,
//       userId,
//     );
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//     return response;
//   };

//   public demoteToMemberAtTeam = async (teamId: string, userId: string) => {
//     const response = await this.teamService.demoteToMemberAtTeam(
//       teamId,
//       userId,
//     );
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//     return response;
//   };

//   public promoteToOwnerAtTeam = async (teamId: string, userId: string) => {
//     const response = await this.teamService.promoteToOwnerAtTeam(
//       teamId,
//       userId,
//     );
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//     return response;
//   };

//   public changeUserRoleAtWorkspace = async (
//     workspaceId: string,
//     userId: string,
//     body: WorkspaceRole,
//   ) => {
//     const response = await this.workspaceService.changeUserRoleAtWorkspace(
//       workspaceId,
//       userId,
//       body,
//     );
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//     return;
//   };

//   public removeUserFromWorkspace = async (
//     workspaceId: string,
//     userId: string,
//   ) => {
//     const response = await this.workspaceService.removeUserFromWorkspace(
//       workspaceId,
//       userId,
//     );
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//   };

//   public setOpenTeam = async (teamId) => {
//     await this.teamRepository.setOpenTeam(teamId);
//   };

//   public disableNewInviteTag = async (
//     userId: string,
//     teamId: string,
//   ): Promise<Team> => {
//     const response: MakeRequestResponse =
//       await this.userService.disableNewInviteTag(userId, teamId);
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//     return;
//   };

//   public updateTeam = async (teamId: string, team): Promise<Team | void> => {
//     const response = await this.teamService.updateTeam(teamId, team);
//     if (response.isSuccessful === true) {
//       return response.data.data;
//     }
//     return;
//   };
// }
