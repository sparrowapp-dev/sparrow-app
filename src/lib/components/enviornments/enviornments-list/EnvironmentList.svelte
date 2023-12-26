<script>
  import { PlusIcon, SelectIcon } from "$lib/assets/app.asset";
  import { Tooltip } from "$lib/components";
</script>

<div class={`env-sidebar`} style={``}>
  <div
    class={`d-flex justify-content-between curr-workspace-heading-container mb-2`}
  >
    <h1
      class={`fw-medium lh-1 curr-workspace`}
      style={`font-size: 18px; text-color: #FFF;`}
    >
      Veloxa
    </h1>
    <Tooltip text={`Add Environment`}>
      <PlusIcon width={15} height={15} color={`#8A9299`} />
    </Tooltip>
  </div>
  <p class={`fw-normal env-item rounded active`}>Global Variables</p>
  <hr />
  <div class={`add-env-container `}>
    <p class={`add-env-desc-text fw-light text-center mb-5`}>
      Add Environments to your Workspace to test your APIs with the relevant set
      of resources and constraints.
    </p>
    <button
      class={`add-env-btn d-flex rounded py-1 px-3 border-0 mx-auto w-fit`}
    >
      <PlusIcon classProp={`my-auto me-2`} />
      <span class={`my-auto`}>Environment</span>
    </button>
  </div>
  <ul class={`env-side-tab-list `}>
    <div class={`d-flex rounded`}>
      <SelectIcon classProp={`my-auto`} width={14} height={14} />
      <p class={`env-item my-auto fw-normal`}>Dev</p>
    </div>
  </ul>
</div>

<style lang="scss">
  .env-sidebar {
    background-color: var(--background-color);
    height: 100vh;
    border-right: 1px solid var(--border-color);
    padding: 0px 24px 8px 12px;
    width: 20vw;
  }
  .curr-workspace-heading-container {
    padding: 18px 4px 6px 0px;
  }
  .add-env-container {
    padding: 32px 0px;
    gap: 24px;
  }
  .add-env-desc-text {
    color: #999;
    font-size: 14px;
  }
  .add-env-btn {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }
  .env-item {
    padding: 6px 6px 6px 12px;
    font-size: 14px;
  }
  .env-item.active {
    background: var(--selected-active-sidebar);
  }
  .env-side-tab-list {
    list-style: none;
  }
</style>
