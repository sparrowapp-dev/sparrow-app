// Repositories

import { WorkspaceService } from "@app/services/workspace.service";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import constants from "@app/constants/constants";
import { getClientUser } from "@app/utils/jwt";

class MarketplaceExplorerViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private workspaceService = new WorkspaceService();

  constructor() {}

  /**
   * @description - get public workspaces list from local db
   */
  get publicWorkspaces() {
    const workspaces = this.workspaceRepository.getPublicWorkspacesDocs();
    return workspaces;
  }

  public constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  public fetchPublicWorkpsace = async (currentPage) => {
    const workspaces =
      await this.workspaceService.fetchPublicWorkspaceList("currentPage");
    if (workspaces?.isSuccessful) {
      const workspaceList = workspaces?.data?.data.workspaces;
      const clientUser = getClientUser();

      workspaceList.forEach(async (workspaceData) => {
        const existingWorkspace = await this.workspaceRepository.readWorkspace(
          workspaceData._id,
        );
        if (!existingWorkspace) {
          const {
            _id,
            name,
            description,
            workspaceType,
            users,
            admins,
            team,
            createdAt,
            createdBy,
            collection,
            updatedAt,
            updatedBy,
            isNewInvite,
          } = workspaceData;
          const item = {
            _id,
            name,
            description,
            workspaceType: workspaceType,
            isShared: true,
            users: [
              {
                email: clientUser?.email,
                id: clientUser?.id,
                name: clientUser?.name,
                role: "viewer",
              },
            ],
            collections: collection ? collection : [],
            admins: admins,
            team,
            environmentId: "",
            isActiveWorkspace: false,
            createdAt,
            createdBy,
            updatedAt,
            updatedBy,
            isNewInvite,
          };
          await this.workspaceRepository.addWorkspace(item);
        }
      });
    }
    return workspaces;
  };
}

export default MarketplaceExplorerViewModel;
