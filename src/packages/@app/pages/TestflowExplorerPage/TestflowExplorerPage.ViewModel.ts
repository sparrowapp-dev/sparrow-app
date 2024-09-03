import { createDeepCopy } from "$lib/utils/helpers";
import type { TabDocument } from "@app/database/database";
import type { Tab } from "@common/types/workspace";
import { BehaviorSubject, Observable } from "rxjs";

export class TestflowExplorerPageViewModel {
  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});

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
}
