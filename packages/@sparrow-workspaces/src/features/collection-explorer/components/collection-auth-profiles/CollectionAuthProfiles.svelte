<script lang="ts">
  import { Button, Modal } from "@sparrow/library/ui";
  import { Table, Row, CreateAuthProfile } from "./sub-component";
  import { AddRegular } from "@sparrow/library/icons";

  export let authProfilesList;
  export let onCreateAuthProfile;
  export let onUpdateAuthProfile;
  export let onDeleteAuthProfile;

  let isAscending = false;
  let isCreateProfileModalOpen = false;
  let noOfProfilesListPerPage: number = 10;
  let currPage = 1;
  let currentSortField = "updatedAt";
  let filterText = "";
  let authProfileFormData = null;
  let isEditMode = false;
  let isWebEnvironment = true;
  let isAdminOrOwner = true; // ToDo: Replace with actual logic to determine if the user is admin or owner
  let openInDesktop = false;

  // For delete auth profile popup
  let authProfileToDelete = null;
  let authProfileDeleteLoader = false;
  let isDeleteAuthProfilePopupOpen = false;

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

  $: sortedData = authProfilesList
    ? [...authProfilesList].sort((a, b) => {
        const aValue = new Date(a[currentSortField]).getTime();
        const bValue = new Date(b[currentSortField]).getTime();
        return isAscending ? aValue - bValue : bValue - aValue;
      })
    : [];

  $: filteredAndSortedData = sortedData
    .filter((item) =>
      item.name.toLowerCase().startsWith(filterText.toLowerCase()),
    )
    .slice(
      (currPage - 1) * noOfProfilesListPerPage,
      currPage * noOfProfilesListPerPage,
    );

  // Methods
  const handleOnClickEditProfile = async (profileData) => {
    authProfileFormData = profileData;
    isEditMode = true;
    isCreateProfileModalOpen = true;
  };

  const handleOnClickDeleteProfile = async (authProfile: string) => {
    isDeleteAuthProfilePopupOpen = true;
    authProfileToDelete = authProfile;
  };

  const handleOnClickCreateProfile = () => {
    authProfileFormData = null;
    isEditMode = false;
    isCreateProfileModalOpen = true;
  };

  const handleModalClose = (flag) => {
    isCreateProfileModalOpen = flag;
    if (!flag) {
      authProfileFormData = null;
      isEditMode = false;
    }
  };
</script>

<div class="h-100 d-flex flex-column">
  <div class="d-flex align-items-center justify-content-between mb-1">
    <p
      class="m-0 text-ds-font-size-16 text-ds-font-weight-semi-bold text-ds-line-height-143"
      style="font-family: Inter,sans-serif;"
    >
      Auth Profiles
    </p>
    <Button
      id={`add-auth-profile`}
      disable={false}
      title={"Add Profile"}
      type={"outline-primary"}
      onClick={handleOnClickCreateProfile}
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
        {#each filteredAndSortedData as list, index}
          <Row
            {list}
            onEditAuthProfile={handleOnClickEditProfile}
            onDeleteAuthProfile={handleOnClickDeleteProfile}
          />
        {/each}
        <!-- 
            {onAddMember}
            activeTeam={openTeam}
            onOpenCollection={onSwitchWorkspace}
            {calculateTimeDifferenceInDays}
            {isAdminOrOwner}
            {onEditAuthProfile}
            {onDeleteAuthProfile}
            {openInDesktop}
            {isWebEnvironment} 
            -->
      </tbody>
    </Table>
  </div>
</div>

<Modal
  title={isEditMode
    ? "Edit Authentication Profile"
    : "Add Authentication Profile"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isCreateProfileModalOpen}
  handleModalState={handleModalClose}
>
  <!-- ToDo: Change compo. name to AuthProfileForm -->
  <CreateAuthProfile
    handleModalState={handleModalClose}
    onCreateProfile={onCreateAuthProfile}
    onUpdateProfile={onUpdateAuthProfile}
    profileData={authProfileFormData}
    {isEditMode}
  />
</Modal>

<Modal
  title={"Delete Auth Profile?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeleteAuthProfilePopupOpen}
  handleModalState={() => {
    isDeleteAuthProfilePopupOpen = false;
    authProfileDeleteLoader = false;
    authProfileToDelete = null;
  }}
>
  <div
    class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium"
  >
    <p>
      This action will permanently delete the <span
        class="text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);"
      >
        "{authProfileToDelete?.name}"
      </span> auth profile. Are you sure you want to proceed?
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
  >
    <Button
      disable={authProfileDeleteLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"secondary"}
      loader={false}
      onClick={() => {
        isDeleteAuthProfilePopupOpen = false;
        authProfileDeleteLoader = false;
        authProfileToDelete = null;
      }}
    />

    <Button
      disable={authProfileDeleteLoader}
      title={"Delete"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"danger"}
      loader={authProfileDeleteLoader}
      onClick={async () => {
        await onDeleteAuthProfile(authProfileToDelete.authId);
        authProfileDeleteLoader = false;
        isDeleteAuthProfilePopupOpen = false;
        authProfileToDelete = null;
      }}
    />
  </div>
</Modal>

<style>
</style>
