import type { TabDocument } from "src/database/database";
import { createDeepCopy } from "@sparrow/common/utils";
import { Observable } from "rxjs";
import type { Tab } from "@sparrow/common/types/workspace/tab";
import { BehaviorSubject } from "rxjs";

export class TestflowDataSetExplorerPageViewModel {
  private _tab = new BehaviorSubject<Partial<Tab>>({});
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
}
