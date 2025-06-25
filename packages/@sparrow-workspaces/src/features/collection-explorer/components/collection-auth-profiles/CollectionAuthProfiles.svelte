<script lang="ts">
  import { Button, Modal } from "@sparrow/library/ui";
  import { Table, Row, CreateAuthProfile } from "./sub-component";
  import { AddRegular } from "@sparrow/library/icons";

  let isAscending = false;

  const tableHeaderContent = [
    "Name",
    "Description",
    "Auth Type",
    "Created At",
    "Default Key",
    "",
    "",
  ];

  function handleSortToggle(field) {
    // if (currentSortField === field) {
    //   isAscending = !isAscending;
    // } else {
    //   currentSortField = field;
    //   isAscending = true;
    // }
  }

  const filteredAndSortedData = [
    {
      name: "Test 1",
      description: "Will be used for GPT 4.0 ",
      auth: {
        authType: "API Key",
      },
      createdAt: "02nd June 2025, 10:15 AM",
      isDefault: true,
    },
  ];
</script>

<div class="h-100 d-flex flex-column">
  <div class="d-flex align-items-center justify-content-between mb-1">
    <p
      class="m-0 text-ds-font-size-14 text-ds-font-weight-semi-bold text-ds-line-height-143"
      style="font-family: Inter,sans-serif;"
    >
      Auth Profiles
    </p>
    <Button
      id={`add-auth-profile`}
      disable={false}
      title={"Add Profile"}
      type={"outline-primary"}
      onClick={() => {}}
      size="medium"
      startIcon={AddRegular}
    />
  </div>

  <div
    class="table-container sparrow-thin-scrollbar overflow-y-auto"
    style="flex:1; overflow:auto;"
  >
    <Table
      tableClassProps="table p-0 table-responsive w-100"
      tableStyleProp="max-height: 100%; "
      dataSearch="true"
      tableHeaderClassProp="position-sticky top-0"
      tableHeaderStyleProp="background-color: var(--bg-ds-surface-900);z-index: 103;"
      contributorsCount={5}
      headerObject={tableHeaderContent}
      onSortToggle={handleSortToggle}
    >
      <tbody class="overflow-y-auto position-relative z-0">
        {#if true}
          {#each filteredAndSortedData as list, index}
            <Row {list} />
            <!-- {onAddMember}
            activeTeam={openTeam}
            onOpenCollection={onSwitchWorkspace}
            {calculateTimeDifferenceInDays}
            {isAdminOrOwner}
            {onDeleteWorkspace}
            {openInDesktop}
            {isWebEnvironment} -->
          {/each}
        {/if}
      </tbody>
    </Table>
  </div>
</div>

<Modal
  title={"Add Authentication Profile"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={true}
  handleModalState={(flag) => {
    // isCreateTeamModalOpen = flag;
  }}
>
  <CreateAuthProfile
    handleModalState={(flag = false) => {
      // isCreateTeamModalOpen = flag;
    }}
    onCreateProfile={() => {}}
  />
</Modal>

<style>
</style>
