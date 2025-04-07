import {
    createDeepCopy,
  } from "@sparrow/common/utils";
import { InitTab } from "@sparrow/common/factory";
import type { Tab } from "@sparrow/common/types/workspace/tab";
  
  /**
   * @class - this class makes collection tab compatible with collection server
   */
  export class WorkspaceTabAdapter {
    constructor() {}
  
    /**
     * @description - parse server data to tab compatible
     * @param _workspaceId - workspace id
     * @param _workspace - workspace server data 
     * @returns
     */
    public adapt(
      _workspaceId: string,
      _workspace: any,
    ): Tab {
      const workspace = createDeepCopy(_workspace);
      const adaptedWorkspace = new InitTab().workspace(_workspaceId, _workspaceId);

      adaptedWorkspace.updateName(workspace.name);
      adaptedWorkspace.updateDescription(workspace.description);
      adaptedWorkspace.updateIsSave(true);
      return adaptedWorkspace.getValue();
    }
  
    /**
     * Parse tab data to server workspace compatible
     * @param _workspaceTab - workspace tab data
     * @returns
     */
    public unadapt(_workspaceTab: Tab) : Partial<any> {
      const workspaceTab = createDeepCopy(_workspaceTab) as Tab;
      return {
        name: workspaceTab.name,
        description : workspaceTab.description
      };
    }
  }
  