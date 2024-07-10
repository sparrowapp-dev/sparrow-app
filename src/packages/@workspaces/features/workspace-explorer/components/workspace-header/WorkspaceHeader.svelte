<script lang="ts">
  import { Input } from "@library/forms";
  import { Button, Tooltip } from "@library/ui";
  import { notifications } from "@library/ui/toast/Toast";
  export let workspaceName: string = "";
  export let workspaceID: string = "";
  export let isWorkspaceInviteModalOpen: boolean;
  export let isDeleteWorkspaceModalOpen: boolean;
  export let onDeleteWorkspace;
  export let onUpdateWorkspaceName: (
    workspaceID: string,
    workspaceName: string,
  ) => void;

  const handleWorkspaceName = async () => {
    if (workspaceName != "") {
      await onUpdateWorkspaceName(workspaceID, workspaceName);
    } else {
      notifications.error("Please Enter A Workspace Name");
    }
  };
</script>

<section>
  <div
    class="About d-flex flex-column h-100"
    style="padding:24px; gap:16px !important; "
  >
    <div class="d-flex" style="justify-content: space-between;">
      <div
        class="ellipsis"
        style="font-weight: 700; font-size:18px; color:var(--text-secondary-100);"
      >
        <Input
          bind:value={workspaceName}
          on:blur={handleWorkspaceName}
          id={"workspace-name"}
          width={"300px"}
          type="text"
          defaultBorderColor="Transparent"
          hoveredBorderColor={"var(--border-primary-300)"}
          focusedBorderColor={"var(--border-primary-300)"}
          class="text-fs-18 bg-transparent  "
          style="outline:none; font-weight:700;"
          placeholder="My Workspace"
        />
      </div>

      <Button
        type={"dark"}
        title={"Delete Workspace"}
        textClassProp={"fs-12 "}
        textStyleProp={"font-weight:400; font-size:12px;"}
        onClick={() => {
          onDeleteWorkspace();
        }}
      />
      <Button
        type={"primary"}
        title={"Invite"}
        textClassProp={"fs-12"}
        textStyleProp={"font-weight:400; font-size:12px;"}
        onClick={() => {
          isWorkspaceInviteModalOpen = true;
        }}
      ></Button>
    </div>
  </div>
</section>
