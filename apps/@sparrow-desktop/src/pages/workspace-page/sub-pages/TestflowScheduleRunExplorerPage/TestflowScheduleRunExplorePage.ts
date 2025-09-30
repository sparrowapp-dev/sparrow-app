import { BehaviorSubject, Observable } from "rxjs";
import { type Tab } from "@sparrow/common/types/workspace/tab";
import { type TabDocument } from "@app/database/database";
import { createDeepCopy } from "@sparrow/common/utils";
import type { TestflowScheduleRunStates } from "@sparrow/common/types/workspace/testflow-schedule-run-tab";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import { TabRepository } from "@app/repositories/tab.repository";

export class TestflowScheduleRunExplorePage {
  private _tab = new BehaviorSubject<Partial<Tab>>({});
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private testflowRepository = new TestflowRepository();

  /**
   * Constructor to initialize the TestflowExplorerPageViewModel class
   * @param doc - TabDocument that contains information about the active tab
   */
  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        delete t.index;
        this.tab = t;
      }, 0);
    }
  }

  /**
   * Returns an observable that emits the current state of the tab
   */
  public get tab(): Observable<Partial<Tab>> {
    return this._tab.asObservable();
  }

  /**
   * Sets the value of the tab and updates the observable
   * @param value - the updated tab value
   */
  private set tab(value: Tab) {
    this._tab.next(value);
  }

  public getTestflowObserver = (_testflowId: string) => {
    return this.testflowRepository.getTestflowObserver(_testflowId);
  }

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  public updateScheduleState = async (_state: TestflowScheduleRunStates) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.testflowScheduleRun.state = {
      ...progressiveTab.property.testflowScheduleRun.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  public runTestflowSingleSchedule = async() => {
  }
}
