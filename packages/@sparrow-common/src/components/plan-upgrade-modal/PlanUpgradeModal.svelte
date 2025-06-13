<script lang="ts">
  import { Modal, Button, Avatar } from "@sparrow/library/ui";

  export let title: string = "";
  export let isOpen: boolean = false;
  export let description: string = "";
  export let planType:
    | "Workspaces"
    | "Testflow"
    | "Collaborators"
    | "Test flow blocks"
    | "Selective Runs"
    | "Run History" = "Workspaces";
  export let planLimitValue: number = 3;
  export let currentPlanValue: number;
  export let activePlan: "active" | "disabled" = "disabled";

  export let userName: string = "";
  export let userEmail: string = "";
  export let handleSubmitButton: () => void;
  export let handleContactSales: () => void;
  export let submitButtonName: "Go to Admin Panel" | "Contact Owner";
  export let isOwner: boolean = false;

  const handleCancel = () => {
    isOpen = false;
  };
</script>

<Modal {title} {isOpen} canClose={true} handleModalState={handleCancel}>
  <div class="d-flex flex-column modal-body">
    <div class="d-flex flex-column">
      <p class="description-text no-margin">{description}</p>

      <div class="plan-usage plan-usage-margin">
        <span class="plan-label">{planType}:</span>
        {#if currentPlanValue}
          <span class="plan-count">{currentPlanValue}</span>
          <span class="plan-limit">/{planLimitValue}</span>
        {:else}
          <span class="plan-active">{activePlan}</span>
        {/if}
      </div>

      {#if userName && !isOwner}
        <div class="d-flex align-items-center gap-3 user-info">
          <Avatar
            type="letter"
            size="large"
            letter={userName[0]}
            bgColor={"var(--bg-ds-secondary-400)"}
          />
          <div class="flex-grow-1">
            <div class="user-name">{`${userName} (You)`}</div>
            <div class="user-email">{userEmail}</div>
          </div>
          <div class="user-role text-center">{"Owner"}</div>
        </div>
      {/if}

      {#if isOwner}
        <div class="note-wrapper">
          <p class="note-text no-margin">
            Note: To unlock the New plan and access more features, please<br />
            <span class="contact-sales" on:click={handleContactSales}>
              contact sales
            </span>
            for more information.
          </p>
        </div>
      {/if}
    </div>

    <div class="d-flex justify-content-end action-buttons">
      {#if submitButtonName}
        <Button
          type="secondary"
          size="medium"
          onClick={handleCancel}
          title="Cancel"
        />
        <Button
          type="primary"
          size="medium"
          onClick={handleSubmitButton}
          title={submitButtonName}
        />
      {/if}
    </div>
  </div>
</Modal>

<style>
  .no-margin {
    margin: 0px;
  }

  .modal-body {
    margin-top: 24px;
  }

  .plan-usage-margin {
    margin-top: 10px;
  }

  .user-info {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 8px;
    padding-right: 8px;
    margin-top: 10px;
  }

  .user-role {
    margin-right: 24px;
  }

  .note-wrapper {
    margin-top: 10px;
  }

  .contact-sales {
    color: var(--text-ds-primary-400);
    text-decoration: underline solid;
    cursor: pointer;
  }

  .action-buttons {
    gap: 12px;
    margin-top: 24px;
  }

  .plan-count {
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: 24px;
    line-height: 1.2;
    letter-spacing: 0;
    color: var(--text-ds-danger-400);
  }

  .plan-limit {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.43;
    letter-spacing: 0;
    color: var(--text-ds-neutral-400);
  }

  .plan-active {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.43;
    letter-spacing: 0;
    color: var(--text-ds-neutral-50);
  }

  .plan-usage {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-ds-neutral-100);
  }

  .plan-label,
  .description-text {
    margin-right: 4px;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.43;
    letter-spacing: 0;
    color: var(--text-ds-neutral-100);
  }

  .user-email,
  .user-name {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0;
  }

  .note-text {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.5;
    letter-spacing: 0;
    color: var(--text-ds-neutral-400);
  }

  .user-email {
    color: var(--text-ds-neutral-300);
  }

  .user-name {
    color: var(--text-ds-neutral-50);
  }

  .user-role {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 1.3;
    letter-spacing: 0;
    text-align: center;
    vertical-align: middle;
    color: var(--text-ds-neutral-100);
  }
</style>
