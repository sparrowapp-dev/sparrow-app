import { RxDB } from "../database/database";

export class WindowSettingReposistory {
  constructor() {}

  public setWindowSetting = async (prop: string, value: string) => {
    const windowSetting = await this.getWindowSetting(prop);
    if (windowSetting) {
      return await windowSetting.incrementalPatch({
        prop,
        value,
      });
    } else {
      return await RxDB.getInstance().rxdb.windowsettings.insert({
        prop,
        value,
      });
    }
  };

  public getWindowSetting = async (prop) => {
    const windowSetting = await RxDB.getInstance()
      .rxdb.windowsettings.findOne({
        selector: {
          prop,
        },
      })
      .exec();
    return windowSetting;
  };

  public updateWindowSetting = async (prop: string, value: string) => {
    const windowSetting = await this.getWindowSetting(prop);
    await windowSetting.incrementalPatch({
      value,
    });
    return;
  };
}
