import {
  InitCollectionTab,
  InitEnvironmentTab,
  InitFolderTab,
  InitRequestTab,
  
} from "@common/utils";
import { InitWorkspaceTab } from "@common/utils/init-workspace-tab";

class InitTab {
  constructor() {}
  /**
   * @param _id - environment mongo document id
   * @param _workspaceId - Workspace mongo id to which environment belongs to
   */
  public environment = (_id: string, _workspaceId: string) => {
    return new InitEnvironmentTab(_id, _workspaceId);
  };
  /**
   * @param _id - request mongo document id
   * @param _workspaceId - Workspace mongo id to which request belongs to
   */
  public request = (_id: string, _workspaceId: string) => {
    return new InitRequestTab(_id, _workspaceId);
  };
  /**
   * @param _id - collection mongo document id
   * @param _workspaceId - Workspace mongo id to which collection belongs to
   */
  public collection = (_id: string, _workspaceId: string) => {
    return new InitCollectionTab(_id, _workspaceId);
  };
  /**
   * @param _id - folder mongo document id
   * @param _workspaceId - Workspace mongo id to which folder belongs to
   */
  public folder = (_id: string, _workspaceId: string) => {
    return new InitFolderTab(_id, _workspaceId);
  };
  /**
   * @param _id - workspace mongo document id
   */
  public workspace = (_id: string) => {
    //   return new InitWorkspaceTab(_id);
    console.error("workspace tab not impemented yet!");
  };
}

export { InitTab };
