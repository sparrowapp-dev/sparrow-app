import {
  InitCollectionTab,
  InitEnvironmentTab,
  InitFolderTab,
  InitGraphqlTab,
  InitMockRequestTab,
  InitRequestTab,
  InitSavedRequestTab,
  InitTestflowTab,
  InitWebSocketTab,
} from "@sparrow/common/utils";
import { InitSocketIoTab } from "../utils/init-socket-io-tab";
import { InitWorkspaceTab } from "../utils/init-workspace-tab";

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
   * @param _id - environment mongo document id
   * @param _workspaceId - Workspace mongo id to which environment belongs to
   */
  public webSocket = (_id: string, _workspaceId: string) => {
    return new InitWebSocketTab(_id, _workspaceId);
  };

  /**
   * @param _id - environment mongo document id
   * @param _workspaceId - Workspace mongo id to which environment belongs to
   */
  public socketIo = (_id: string, _workspaceId: string) => {
    return new InitSocketIoTab(_id, _workspaceId);
  };

  /**
   * @param _id - graphql mongo document id
   * @param _workspaceId - Workspace mongo id to which environment belongs to
   */
  public graphQl = (_id: string, _workspaceId: string) => {
    return new InitGraphqlTab(_id, _workspaceId);
  };

  /**
   * @param _id - testflow mongo document id
   * @param _workspaceId - Workspace mongo id to which testflow belongs to
   */
  public testflow = (_id: string, _workspaceId: string) => {
    return new InitTestflowTab(_id, _workspaceId);
  };
  /**
   * @param _id - request mongo document id
   * @param _workspaceId - Workspace mongo id to which request belongs to
   */
  public request = (_id: string, _workspaceId: string) => {
    return new InitRequestTab(_id, _workspaceId);
  };

  /**
   * @param _id - request mongo document id
   * @param _workspaceId - Workspace mongo id to which request belongs to
   */
  public savedRequest = (_id: string, _workspaceId: string) => {
    return new InitSavedRequestTab(_id, _workspaceId);
  };
  /**
   * @param _id - request mongo document id
   * @param _workspaceId - Workspace mongo id to which request belongs to
   */
  public mockRequest = (_id: string, _workspaceId: string) => {
    return new InitMockRequestTab(_id, _workspaceId);
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
  public workspace = (_id: string, _workspaceId: string) => {
    return new InitWorkspaceTab(_id, _workspaceId);
  };
}

export { InitTab };
