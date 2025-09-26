<script lang="ts">
  import { TestflowScheduleNavigatorEnum } from "@sparrow/common/types/workspace/testflow-schedule-tab";

  import { Navigator } from "@sparrow/library/ui";
  export let scheduleNavigator;
  export let onUpdateScheduleState;

  let tabs: {
    name: string;
    id: TestflowScheduleNavigatorEnum;
    count: number;
  }[] = [];

  /**
   * @description - refresh tabs label count
   */
  const refreshTabs = () => {
    return [
      {
        name: "Test Results",
        id: TestflowScheduleNavigatorEnum.TEST_RESULTS,
        count: 0,
      },
      {
        name: "Configuration",
        id: TestflowScheduleNavigatorEnum.CONFIGURATION,
        count: 0,
      },
    ];
  };

  /**
   * @description - re-calculates value when dependency changes
   */
  $: {
    tabs = refreshTabs();
  }

  /**
   * @description - handles different key press
   * @param event - keyboard events
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.altKey && event.code === "KeyT") {
      onUpdateScheduleState({
        scheduleNavigator: TestflowScheduleNavigatorEnum.TEST_RESULTS,
      });
    } else if (event.altKey && event.code === "KeyC") {
      onUpdateScheduleState({
        scheduleNavigator: TestflowScheduleNavigatorEnum.CONFIGURATION,
      });
    }
  };

  const onTabClick = (tabId: TestflowScheduleNavigatorEnum) => {
    onUpdateScheduleState({ scheduleNavigator: tabId });
  };
</script>

<div style="padding-bottom: 12px; position:relative;" class="z-5">
  <div class="d-flex justify-content-between">
    <Navigator {tabs} {onTabClick} currentTabId={scheduleNavigator} />
  </div>
</div>

<svelte:window on:keydown={handleKeyPress} />
