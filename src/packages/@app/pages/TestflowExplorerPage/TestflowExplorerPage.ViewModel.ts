import { createDeepCopy } from "$lib/utils/helpers";
import type { TabDocument } from "@app/database/database";
import { TabRepository } from "@app/repositories/tab.repository";
import type { Tab } from "@common/types/workspace";
import { Debounce } from "@common/utils";
import { BehaviorSubject, Observable } from "rxjs";

export class TestflowExplorerPageViewModel {
  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});
  private tabRepository = new TabRepository();

  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        this.tab = t;
      }, 0);
    }
  }

  public get tab(): Observable<Tab> {
    return this._tab.asObservable();
  }

  private set tab(value: Tab) {
    this._tab.next(value);
  }
  /**
   *
   * @param _nodes - nodes of the testflow
   */

  private updateNodesDebounce = async (_nodes) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const nodes = _nodes.map((elem) => {
      return {
        id: elem.id,
        type: elem.type,
        data: {
          label: elem.data.label,
        },
        position: { x: elem.position.x, y: elem.position.y },
      };
    });
    progressiveTab.property.testflow.nodes = nodes;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // this.compareRequestWithServer();
  };

  public updateNodes = new Debounce().debounce(this.updateNodesDebounce, 300);
  /**
   *
   * @param _edges - edges of the testflow
   */
  private updateEdgesDebounce = async (_edges: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.testflow.edges = _edges;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // this.compareRequestWithServer();
  };

  public updateEdges = new Debounce().debounce(this.updateEdgesDebounce, 300);
}
