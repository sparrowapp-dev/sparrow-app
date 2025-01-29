<script>
  import { Button } from "@sparrow/library/ui";
  export let handleSwitch;
  export let isSwitchWorkspaceModalOpen;
  export let workspaceName = "name";
  export let requestName = "name";
</script>

<!-- Section for the modal content -->
<section>
  <div>
    <p class="lightGray" style="color: lightGray;">
      The {requestName} belongs to the {workspaceName} workspace. To access this,
      you need to switch workspace. Do you want to continue?
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
