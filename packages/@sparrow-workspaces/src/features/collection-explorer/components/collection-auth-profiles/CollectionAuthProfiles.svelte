<script lang="ts">
  import { Button, Modal } from "@sparrow/library/ui";
  import { Table, Row, AuthProfileForm } from "./sub-component";
  import { AddRegular, PersonKeyRegular } from "@sparrow/library/icons";
  import {
    DoubleLeftIcon,
    DoubleRightIcon,
    LeftIcon,
    RightIcon,
  } from "@sparrow/library/assets";
  import type { CollectionAuthProifleBaseInterface as AuthProfileDto } from "@sparrow/common/types/workspace/collection-base";

  export let authProfilesList;
  export let onCreateAuthProfile;
  export let onUpdateAuthProfile;
  export let onDeleteAuthProfile;
  export let onUpdateRequestState;

  let isEditMode = false;
  let authProfileFormData: AuthProfileDto | null = null;
  let isCreateProfileModalOpen = false;

  let openInDesktop = false;
  let isAdminOrOwner = true; // ToDo: Replace with actual logic to determine if the user is admin or owner
  let isWebEnvironment = true;

  let currPage = 1;
  let filterText = "";
  let isAscending = false;
  let currentSortField = "createdAt"; // Default sort field
  let noOfProfilesListPerPage: number = 6;

  // For delete auth profile popup
  let authProfileToDelete: AuthProfileDto | null = null;
  let authProfileDeleteLoader = false;
  let isDeleteAuthProfilePopupOpen = false;

  const tableHeaderContent = [
    "Name",
    "Description",
    "Auth Type",
    "Created At (UTC)",
    "Default Key",
    "",
    "",
  ];

  function handleSortToggle(field) {
    if (currentSortField === field) {
      isAscending = !isAscending;
    } else {
      currentSortField = field;
      isAscending = true;
    }
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
  const handleOnClickEditProfile = async (profileData: AuthProfileDto) => {
    authProfileFormData = profileData;
    isEditMode = true;
    isCreateProfileModalOpen = true;
  };

  const handleOnClickDeleteProfile = async (authProfile: AuthProfileDto) => {
    isDeleteAuthProfilePopupOpen = true;
    authProfileToDelete = authProfile;
  };

  const handleOnClickCreateProfile = () => {
    authProfileFormData = null;
    isEditMode = false;
    isCreateProfileModalOpen = true;
  };

  // Add state to track selected default key
  let selectedDefaultKey = "";

  // Initialize selectedDefaultKey with the currently default auth profile
  $: if (filteredAndSortedData) {
    const defaultAuth = filteredAndSortedData.find((item) => item.defaultKey);
    if (defaultAuth) {
      selectedDefaultKey = defaultAuth.authId;
    }
  }

  // Handle default key change
  const handleDefaultKeyChange = (authId, authProfile) => {
    selectedDefaultKey = authId;
    console.log("Selected Default Key:", selectedDefaultKey, authProfile);
    authProfile.defaultKey = true; // Mark the selected item as default
    // onUpdateRequestState({ selectedAuthType: authId });
    onUpdateAuthProfile(authId, authProfile);
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
            listIndex={index}
            {selectedDefaultKey}
            onDefaultKeyChange={handleDefaultKeyChange}
            onEditAuthProfile={handleOnClickEditProfile}
            onDeleteAuthProfile={handleOnClickDeleteProfile}
          />
        {/each}
      </tbody>
    </Table>

    <!-- No Profile Available View -->
    {#if authProfilesList.length === 0}
      <hr style="margin: 0; height: 0.2px;" />
      <div class="container">
        <div class="pb-2">
          <PersonKeyRegular size="50px" color="var(--icon-ds-surface-50)" />
        </div>
        <p
          class="text-ds-font-size-14 text-ds-font-weight-medium text-ds-line-height-143 m-0"
          style="color:var(--text-ds-neutral-400);"
        >
          No Auth Profile is created yet.
        </p>
        <p
          class="text-ds-font-size-14 text-ds-font-weight-medium text-ds-line-height-143"
          style="color:var(--text-ds-neutral-400);"
        >
          Click <strong style="color:var(--text-ds-neutral-300);"
            >"Add Profile"</strong
          > button to create authentication profile.
        </p>
      </div>
    {/if}
  </div>

  <!-- Pagination Bar -->
  {#if authProfilesList
    .slice()
    .reverse()
    .filter((item) => item.name
        .toLowerCase()
        .startsWith(filterText.toLowerCase()))
    .slice((currPage - 1) * noOfProfilesListPerPage, currPage * noOfProfilesListPerPage).length > 0}
    <table class="bottom-0" style="width: 53%;">
      <tfoot>
        <tr class="d-flex justify-content-between">
          <th class="tab-head" style=""
            >Showing {(currPage - 1) * noOfProfilesListPerPage + 1} - {Math.min(
              currPage * noOfProfilesListPerPage,
              authProfilesList?.filter((item) =>
                item.name.toLowerCase().startsWith(filterText.toLowerCase()),
              ).length,
            )} of {authProfilesList?.filter((item) =>
              item.name.toLowerCase().startsWith(filterText.toLowerCase()),
            ).length}
          </th>
          <th class="tab-head tab-change" style="">
            <button
              on:click={() => (currPage = 1)}
              class="bg-transparent border-0"
            >
              <DoubleLeftIcon
                color={currPage === 1 ? "var(--border-secondary-200)" : "white"}
              /></button
            >
            <button
              on:click={() => {
                if (currPage > 1) currPage -= 1;
              }}
              class="bg-transparent border-0"
            >
              <LeftIcon
                color={currPage === 1 ? "var(--border-secondary-200)" : "white"}
              /></button
            >
            <button
              on:click={() => {
                if (
                  currPage <
                  Math.ceil(
                    authProfilesList?.filter((item) =>
                      item.name
                        .toLowerCase()
                        .startsWith(filterText.toLowerCase()),
                    ).length / noOfProfilesListPerPage,
                  )
                )
                  currPage += 1;
              }}
              class="bg-transparent border-0"
            >
              <RightIcon
                color={currPage ===
                Math.ceil(
                  authProfilesList?.filter((item) =>
                    item.name
                      .toLowerCase()
                      .startsWith(filterText.toLowerCase()),
                  ).length / noOfProfilesListPerPage,
                )
                  ? "var(--border-secondary-200)"
                  : "white"}
              /></button
            >
            <button
              on:click={() =>
                (currPage = Math.ceil(
                  authProfilesList?.filter((item) =>
                    item.name
                      .toLowerCase()
                      .startsWith(filterText.toLowerCase()),
                  ).length / noOfProfilesListPerPage,
                ))}
              class="bg-transparent border-0"
            >
              <DoubleRightIcon
                color={currPage ===
                Math.ceil(
                  authProfilesList?.filter((item) =>
                    item.name
                      .toLowerCase()
                      .startsWith(filterText.toLowerCase()),
                  ).length / noOfProfilesListPerPage,
                )
                  ? "var(--border-secondary-200)"
                  : "white"}
              /></button
            >
          </th>
          <!-- <th class="tab-head px-0 ms-0"></th> -->
        </tr>
      </tfoot>
    </table>
  {/if}
</div>

<!-- Auth Prfile Form Popup -->
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
  <AuthProfileForm
    handleModalState={handleModalClose}
    onCreateProfile={onCreateAuthProfile}
    onUpdateProfile={onUpdateAuthProfile}
    profileData={authProfileFormData}
    {isEditMode}
  />
</Modal>

<!-- Delete Auth Prfile Popup -->
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
        await onDeleteAuthProfile(authProfileToDelete?.authId);
        authProfileDeleteLoader = false;
        isDeleteAuthProfilePopupOpen = false;
        authProfileToDelete = null;
      }}
    />
  </div>
</Modal>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 80%;
    padding: 130px 35px 24px;
  }
  .not-found-text {
    color: var(--text-secondary-200);
    font-size: 16px;
    font-weight: 400;
    text-align: center;
  }

  .tab-data {
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    background-color: transparent;
  }
  .tab-head {
    padding: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: var(--text-secondary-200);
    background-color: transparent;
  }
  .tab-change {
    margin-left: 203px;
  }
  table {
    background-color: transparent;
  }
</style>
