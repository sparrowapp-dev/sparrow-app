<script lang="ts">
  import { TestflowNavigatorEnum } from "@sparrow/common/types/workspace/testflow";
  import { TestflowScheduleNavigatorEnum } from "@sparrow/common/types/workspace/testflow-schedule-tab";

  import { Navigator } from "@sparrow/library/ui";
  export let testflowNavigator;
  export let onUpdateTestflowState;

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
        name: "Test Flow",
        id: TestflowNavigatorEnum.TESTFLOW,
        count: 0,
      },
      {
        name: "Scheduled Run",
        id: TestflowNavigatorEnum.SCHEDULE,
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
  // const handleKeyPress = (event: KeyboardEvent) => {
  //   if (event.altKey && event.code === "KeyT") {
  //     handleUpdateRequestData({
  //       testflowNavigator: TestflowScheduleNavigatorEnum.TEST_RESULTS,
  //     });
  //   } else if (event.altKey && event.code === "KeyC") {
  //     handleUpdateRequestData({
  //       testflowNavigator: TestflowScheduleNavigatorEnum.CONFIGURATION,
  //     });
  //   }
  // };

  const onTabClick = (tabId: TestflowNavigatorEnum) => {
    onUpdateTestflowState({ testflowNavigator: tabId });
  };
</script>

<div style="padding-bottom: 12px; position:relative;" class="z-5">
  <div class="d-flex justify-content-between">
    <Navigator {tabs} {onTabClick} currentTabId={testflowNavigator} />
  </div>
</div>

<!-- <svelte:window on:keydown={handleKeyPress} /> -->
