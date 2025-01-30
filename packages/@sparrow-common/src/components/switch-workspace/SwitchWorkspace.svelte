<script>
  import { Button } from "@sparrow/library/ui";
  export let handleSwitch;
  export let isSwitchWorkspaceModalOpen;
  export let workspaceName = "name";
  export let requestName = "name";
  export let handlehideGlobalSearch;
</script>

<!-- Section for the modal content -->
<section>
  <div>
    <p class="text" style="color: var(--text-secondary-1000); margin-top:5px;">
      The {requestName} belongs to the
      <span style="font-weight: 700;">{workspaceName}</span> workspace. To access
      this, you need to switch workspace. Do you want to continue?
    </p>
  </div>

  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end">
    <span style="margin-right: 15px;">
      <Button
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
          isSwitchWorkspaceModalOpen = false;
          handlehideGlobalSearch(false);
        }}
      />
    </span>
    <Button
      disable={false}
      title={"Yes, Continue"}
      textClassProp={"fs-6"}
      type={"primary"}
      onClick={() => {
        handleSwitch();
      }}
    />
  </div>
</section>

<style>
  .text {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    font: Inter, sans-serif;
  }
</style>
