<script lang="ts">
  import { Select } from "$lib/components/inputs";
  import { StackIcon } from "@library/icons";
  import { environmentType } from "$lib/utils/enums";
  export let environments;
  export let currentEnvironment;
  export let onInitActiveEnvironmentToWorkspace;
  export let currentWorkspaceId;
  let handleDropdown = (tabId: string) => {
    onInitActiveEnvironmentToWorkspace(currentWorkspaceId, tabId);
  };
</script>

<header class="ps-1 pe-3 d-flex align-items-center justify-content-between">
  <div>sparrow-app</div>
  <div>
    <Select
      id={"environment-selector"}
      data={[
        {
          name: "No Environment",
          id: "none",
          type: environmentType.LOCAL,
        },
        ...environments,
      ].filter((elem) => {
        return elem.type === environmentType.LOCAL;
      })}
      titleId={currentEnvironment?.id}
      onclick={handleDropdown}
      minHeaderWidth={"200px"}
      iconRequired={true}
      icon={StackIcon}
      isDropIconFilled={true}
      borderType={"none"}
      borderActiveType={"none"}
      headerHighlight={""}
      headerTheme={"transparent"}
      menuItem={"v2"}
      headerFontSize={"12px"}
      maxHeaderWidth={"200px"}
      zIndex={200}
      bodyTheme={"violet"}
    />
  </div>
</header>

<style>
  header {
    height: 44px;
  }
</style>
