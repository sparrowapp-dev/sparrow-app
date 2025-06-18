<script lang="ts">
  import type { Observable } from "rxjs";
  import {
    CollectionCount,
    WorkspaceAbout,
    WorkspaceHeader,
    WorkspaceNavigator,
    WorkspaceSetting,
    WorkspaceUpdates,
  } from "../components";
  import { TeamRole, WorkspaceType } from "@sparrow/common/enums";
  import { Button } from "@sparrow/library/ui";
  import { ShareMultipleRegular } from "@sparrow/library/icons";
  import { SparrowOutlineIcon } from "@sparrow/common/icons";
  import { planInfoByRole } from "@sparrow/common/utils";
  import { PlanUpgradeModal } from "@sparrow/common/components";

  /**
   * The length of collections related to the workspace.
   */
  export let collectionLength = 0;

  /**
   * The current active tab or section within the workspace.
   */
  export let tab;

  /**
   * Function to update the workspace name.
   */
  export let onUpdateWorkspaceName;

  /**
   * Function to update the workspace description.
   */
  export let onUpdateWorkspaceDescription;

  /**
   * Boolean flag to indicate if the workspace invite modal is open.
   */
  export let isWorkspaceInviteModalOpen: boolean = false;

  /**
   * Function to delete the workspace.
   */
  export let onDeleteWorkspace;

  /**
   * The current active workspace object.
   */
  export let currentWorkspace;

  export let onRemoveUserFromWorkspace;
  export let onChangeUserRoleAtWorkspace;

  /**
   * List of updates of a workspace
   */
  export let workspaceUpdatesList: Observable<any[]>;

  /**
   * Function to be called on end of scroll
   */
  export let onWorkspaceUpdateScroll;

  /**
   * Role of user in active workspace
   */
  export let userRole: any;

  /**
   * Details of active workspace
   */
  export let activeWorkspace;

  export let isShareModalOpen;
  export let currrentInvites;

  export let upgradePlanModalInvite: boolean = false;
  export let handleRedirectAdminPanel: () => void;
  export let contactOwner: () => void;
  export let handleContactSales: () => void;
  export let planLimits: () => void;
  export let teamDetails: any;

  let userLimits: any;
  let planContent: any;

  let workspaceID = $tab?.id;

  let workspaceNavigatorId: string = "about";

  export let onSaveWorkspace;
  export let workspaceType: WorkspaceType = WorkspaceType.PRIVATE;
  export let isSharedWorkspace = false;
  export let onMakeWorkspacePublic;
  export let onShareWorkspace;
  export let onClickHubUrl;

  const formateUpdateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);
    const months = Math.floor(days / 30); // Approximation

    if (seconds < 60) {
      return "just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days < 30) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (months) {
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      return ``;
    }
  };

  const getPlanLimits = async () => {
    const data = await planLimits();
    userLimits = data;
  };

  $: {
    getPlanLimits();
    if (userRole) {
      planContent = planInfoByRole(userRole);
    }
  }
</script>

{#if isSharedWorkspace && workspaceType === WorkspaceType.PUBLIC}
  <div style="padding:8px;">
    <div class="d-flex flex-column" style="padding: 4px; ">
      <div class="d-flex flex-column">
        <div>
          <div
            class="d-flex flex-row justify-content-between align-items-center"
            style="gap:20px;"
          >
            <div
              class="text-ds-font-size-20 text-ds-font-weight-semi-bold ellipsis"
              style="color:var(--text-ds-neutral-50); max-width: 75%;"
            >
              {activeWorkspace?.name}
            </div>
            <div>
              <Button
                title={"Share workspace"}
                type={"secondary"}
                size="medium"
                onClick={() => {
                  isShareModalOpen = true;
                }}
                startIcon={ShareMultipleRegular}
              ></Button>
            </div>
          </div>
          <Button
            title={`By ${
              activeWorkspace?.team?.teamName.length > 100
                ? activeWorkspace?.team?.teamName.slice(0, 100) + "..."
                : activeWorkspace?.team?.teamName
            }`}
            type={"link-primary"}
            size="small"
            buttonClassProp="ps-0 pe-1"
            onClick={() => {
              onClickHubUrl(
                activeWorkspace?.team?.teamId,
                currentWorkspace?.id,
              );
            }}
          />
        </div>
        <hr style="color: var(--border-ds-surface-50); margin-top:0" />
      </div>
      <div class="d-flex flex-column" style="gap: 8px; position: relative;">
        <div
          class="d-flex flex-column text-ds-font-size-14 text-ds-font-weight-regular"
          style="gap:8px; color: var(--text-ds-neutral-50);"
        >
          <span
            >Last Updated: {formateUpdateTime(activeWorkspace?.updatedAt)}</span
          >
          <div class="d-flex flex-row" style="gap:4px;">
            <span style="color: var(--text-ds-primary-300);"
              >{collectionLength}</span
            >
            <span>Collections</span>
          </div>
        </div>
        <div style="color: var(--text-ds-neutral-50); gap: 14px">
          <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
            >Workspace Summary</span
          >
          <p
            class="text-ds-font-size-14 text-ds-font-weight-regular text-ds-line-height-143"
            style="width: 60%;"
          >
            {activeWorkspace?.description
              ? activeWorkspace.description
              : "No summary added."}
          </p>
        </div>
        <div class="background-icon">
          <SparrowOutlineIcon width={350} height={350} />
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="d-flex h-100" style="width: 100%;">
    <div
      class="h-100 d-flex flex-column p-3"
      style="border-right:2px solid #000000; width: calc(100% - 280px);"
    >
      <WorkspaceHeader
        {userRole}
        {isSharedWorkspace}
        {workspaceType}
        bind:isWorkspaceInviteModalOpen
        {onDeleteWorkspace}
        {onUpdateWorkspaceName}
        workspaceName={$tab?.name}
        {workspaceID}
        {onSaveWorkspace}
        isSaved={$tab?.isSaved}
      />
      <hr />
      <section style="flex:1; overflow:auto;">
        {#if workspaceNavigatorId === "about"}
          <WorkspaceAbout
            bind:isShareModalOpen
            {userRole}
            workspaceName={$tab?.name}
            {onUpdateWorkspaceDescription}
            workspaceDescription={$tab?.description}
            {workspaceType}
            {onMakeWorkspacePublic}
            {onShareWorkspace}
            {onUpdateWorkspaceName}
          />
        {:else if workspaceNavigatorId === "settings"}
          <WorkspaceSetting
            users={currentWorkspace?.users}
            {currentWorkspace}
            {onRemoveUserFromWorkspace}
            {onChangeUserRoleAtWorkspace}
          />
        {/if}
      </section>
    </div>

    <div class="d-flex flex-column h-100 p-3" style=" width:280px;">
      <WorkspaceNavigator bind:workspaceNavigatorId {userRole} />
      <WorkspaceUpdates
        workspaceUpdatesList={$workspaceUpdatesList}
        {onWorkspaceUpdateScroll}
        {isSharedWorkspace}
      />
      <hr />
      <CollectionCount {collectionLength} />
    </div>
  </div>
{/if}

<PlanUpgradeModal
  bind:isOpen={upgradePlanModalInvite}
  title={planContent?.title}
  description={planContent?.description}
  planType="Collaborators"
  planLimitValue={userLimits?.usersPerHub?.value}
  currentPlanValue={currrentInvites +
    (currentWorkspace?.users?.length || 0) -
    1}
  isOwner={userRole === TeamRole.TEAM_OWNER || userRole === TeamRole.TEAM_ADMIN
    ? true
    : false}
  {handleContactSales}
  handleSubmitButton={userRole === TeamRole.TEAM_OWNER ||
  userRole === TeamRole.TEAM_ADMIN
    ? handleRedirectAdminPanel
    : contactOwner}
  userName={teamDetails?.teamName}
  userEmail={teamDetails?.teamOwnerEmail}
  submitButtonName={planContent?.buttonName}
/>

<style>
  .background-icon {
    position: absolute;
    top: 140%;
    left: 50%;
    opacity: 0.04;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  }
</style>
