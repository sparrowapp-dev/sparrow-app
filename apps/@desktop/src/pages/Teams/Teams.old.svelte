<script lang="ts">
  import type { WorkspaceMethods } from "@deprecate/utils/interfaces/workspace.interface";

  import type { Observable } from "rxjs";
  import type { TeamDocument } from "@app/database/database";
  import type {
    CollectionsMethods,
    CurrentTeam,
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "@deprecate/utils/interfaces";
  import type { Path } from "@deprecate/utils/interfaces/request.interface";
  import { TeamViewModel } from "./Teams.ViewModel.old";
  import { Motion } from "svelte-motion";
  import { user } from "@app/store/auth.store";

  import type { WorkspaceDocument } from "@app/database/database";
  /**
   * @deprecated referes to teams store
   * import { openedTeam, setOpenedTeam } from "@app/store/auth.store/team.store";
   * import { isTeamCreatedFirstTime } from "@app/store/auth.store/team.store";
   **/

  import {
    // isWorkspaceCreatedFirstTime,
    // isWorkspaceLoaded,
    // workspaceLeftPanelWidth,
    // workspaceRightPanelWidth,
  } from "@app/store/auth.store";
  import { generateSampleWorkspace } from "@deprecate/utils/sample/workspace.sample";
  import { UntrackedItems } from "@deprecate/utils/enums/item-type.enum";
  import { onDestroy, onMount } from "svelte";
  import {} from "@app/store/auth.store";
  import { generateSamepleTeam } from "@deprecate/utils/sample";
  import { moveNavigation } from "@deprecate/utils/helpers";
  import { navigate } from "svelte-navigator";
  import { notifications } from "@sparrow/library/ui";

  import { v4 as uuidv4 } from "uuid";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import DragDrop from "import { List } from "@sparrow/library/ui";dragdrop/DragDrop.svelte";
  import { Pane, Splitpanes } from "svelte-splitpanes";

  export let data: any;
  export let handleWorkspaceSwitch: any;
  export let handleWorkspaceTab: any;
  export let activeSideBarTabMethods: any;
  export let collectionsMethods: CollectionsMethods;
  export let currentTeam: CurrentTeam;
  export let refreshTeamsWorkspaces: (userId: string) => void;

  let allTeams: any[] = [];
  let userId: string = "";
  let activeTeamRxDoc: TeamDocument;
  let workspaceUnderCreation: boolean = false;
  let isCreateTeamModalOpen: boolean;
  let isShowMoreVisible: boolean = false;
  let openLeaveTeamModal: boolean = false;
  let isLeavingTeam: boolean = false;

  let newTeam: {
    name: {
      value: string;
      invalid: boolean;
    };
    description: {
      value: string;
      invalid: boolean;
    };
    file: {
      value: any;
      invalid: boolean;
      showFileTypeError: boolean;
      showFileSizeError: boolean;
    };
  };

  const _viewModel = new TeamViewModel();
  // const _viewModelWorkspace = new HeaderDashboardViewModel();
  const teams: Observable<TeamDocument[]> = _viewModel.teams;
  const activeTeam: Observable<TeamDocument> = _viewModel.activeTeam;
  const openTeam: Observable<TeamDocument> = _viewModel.openTeam;
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const tabList = _viewModel.tabs;
  const collectionList = _viewModel.collection;

  const workspaceMethods: WorkspaceMethods = {
    handleCreateTab: _viewModel.handleCreateTab,
  };
  // const teamRepositoryMethods: TeamRepositoryMethods = {
  //   modifyTeam: _viewModel.modifyTeam,
  //   setOpenTeam: _viewModel.setOpenTeam,
  //   getTeam: _viewModel.getTeam,
  // };
  // const teamServiceMethods: TeamServiceMethods = {
  //   inviteMembersAtTeam: _viewModel.inviteMembersAtTeam,
  //   removeMembersAtTeam: _viewModel.removeMembersAtTeam,
  //   promoteToAdminAtTeam: _viewModel.promoteToAdminAtTeam,
  //   demoteToMemberAtTeam: _viewModel.demoteToMemberAtTeam,
  //   promoteToOwnerAtTeam: _viewModel.promoteToOwnerAtTeam,
  //   refreshWorkspace: _viewModelWorkspace.refreshWorkspaces,
  //   changeUserRoleAtWorkspace: _viewModel.changeUserRoleAtWorkspace,
  //   removeUserFromWorkspace: _viewModel.removeUserFromWorkspace,
  //   disableNewInviteTag: _viewModel.disableNewInviteTag,
  //   updateTeam: _viewModel.updateTeam,
  // };

  const userSubscribe = user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });

  let leaveTeamName = "";

  /**
   * @deprecated referes to teams store
   *   const openedTeamSubscribe = openedTeam.subscribe((value) => {
   *   if (value) {
   *    currOpenedTeam = value;
   *    }
   *  });
   **/

  const activeTeamSubscribe = activeTeam.subscribe((value: TeamDocument) => {
    if (value) {
      activeTeamRxDoc = value;
      /**
       * @deprecated referes to teams store
       *  setOpenedTeam(
       *    currOpenedTeam.id ? currOpenedTeam.id : value.get("teamId"),
       *    currOpenedTeam.name ? currOpenedTeam.name : value.get("name"),
       *    currOpenedTeam.base64String
       *      ? currOpenedTeam.base64String
       *      : value.get("logo"),
       *  );
       **/
    }
  });

  const teamSubscribe = teams.subscribe((value: TeamDocument[]) => {
    if (value && value.length > 0) {
      const teamArr = value.map((teamDocument: TeamDocument) => {
        const teamObj = _viewModel.getTeamDocument(teamDocument);
        return teamObj;
      });
      allTeams = teamArr;
    }
  });

  const handleCreateWorkspace = async () => {
    workspaceUnderCreation = true;
    // isWorkspaceCreatedFirstTime.set(true);
    isWorkspaceLoaded.set(false);
    const workspaceObj = generateSampleWorkspace(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toISOString(),
      undefined,
      $openTeam?.teamId,
    );

    const workspaceData = {
      name: workspaceObj.name,
      id: $openTeam?.teamId,
      createdAt: workspaceObj.createdAt,
    };

    const response = await _viewModel.createWorkspace(workspaceData);

    if (response.isSuccessful) {
      let totalRequest: number = 0;
      const responseData = response.data?.data;
      // $data.map((item) => {
      //   if (item) {
      //     if (item._data._id !== responseData._id) {
      //       totalRequest = 0;
      //     }
      //   }
      // });

      let path: Path = {
        workspaceId: responseData._id,
        collectionId: "",
      };

      workspaceObj._id = responseData._id;
      workspaceObj.id = responseData._id;
      workspaceObj.name = responseData.name;
      workspaceObj.description =
        responseData?.description ?? workspaceObj.description;
      workspaceObj.team = {
        teamId: responseData?.team?.id,
        teamName: response?.data?.data?.team?.teamName,
      };
      workspaceObj.users = responseData?.users;
      workspaceObj.createdAt = responseData?.createdAt;
      workspaceObj.createdBy = responseData?.createdBy;
      workspaceObj.isActiveWorkspace = false;
      workspaceObj.environments = responseData?.environments;
      workspaceObj.path = path;
      workspaceObj.property.workspace.requestCount = totalRequest;
      workspaceObj.property.workspace.collectionCount = 0;
      workspaceObj.save = true;
      collectionsMethods.handleCreateTab(workspaceObj);
      collectionsMethods.handleActiveTab(workspaceObj._id);
      moveNavigation("right");
      // isWorkspaceCreatedFirstTime.set(true);
      notifications.success("New Workspace Created");
      isWorkspaceLoaded.set(true);
      let newWorkspace = response.data.data;
      newWorkspace.team.teamId = newWorkspace.team.id;
      newWorkspace.team.teamName = newWorkspace.team.name;
      delete newWorkspace.team.id;
      delete newWorkspace.team.name;
      if (userId) await _viewModel.refreshTeams(userId);
      await _viewModel.addWorkspace(newWorkspace);
      // await _viewModelWorkspace.activateWorkspace(newWorkspace._id);

      activeSideBarTabMethods.updateActiveTab("collections");
      navigate("/dashboard/collections");
    } else {
      workspaceUnderCreation = false;
      // isWorkspaceCreatedFirstTime.set(false);
      isWorkspaceLoaded.set(true);
      notifications.error(response.message);
    }
  };

  const handleCreateTeam = async (
    name: string,
    description: string,
    file: File,
  ) => {
    if (name == "") {
      newTeam.name.invalid = true;
      return;
    }
    if (newTeam.file.showFileSizeError || newTeam.file.showFileTypeError)
      return;

    // isTeamCreatedFirstTime.set(true);
    const teamObj = generateSamepleTeam(name, description, file, userId);
    const response = await _viewModel.createTeam(teamObj);

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      await _viewModel.refreshTeams(userId);
      // await teamRepositoryMethods.setOpenTeam(response.data.data?._id);
      /**
       * @deprecated referes to teams store
       * setOpenedTeam(
       *   response.data.data?._id,
       *   response?.data?.data?.name,
       *   response?.data?.data?.logo,
       * );
       **/

      // await teamRepositoryMethods.setOpenTeam(res?._id);
      notifications.success(`New team ${teamObj.name} is created.`);
      handleCreateTeamModal();
    } else {
      await _viewModel.leaveTeam(teamObj.teamId);
      await _viewModel.removeTeam(teamObj.teamId);
      handleCreateTeamModal();
      notifications.error(response.message ?? "Failed to create a new team.");
    }
  };

  const handleLeaveTeam = async () => {
    if (!$openTeam?.teamId) return;
    isLeavingTeam = true;
    const teamId = $openTeam?.teamId;
    const response = await _viewModel.leaveTeam($openTeam?.teamId);
    if (response.isSuccessful) {
      setTimeout(async () => {
        // const activeTeam = await _viewModel.checkActiveTeam();
        if (activeTeam) {
          const teamIdToActivate = await _viewModel.activateInitialWorkspace();
          // if (teamIdToActivate) {
          //   await _viewModel.activateTeam(teamIdToActivate);
          // }
        }
        setTimeout(async () => {
          await _viewModel.refreshTeams(userId);
          // await _viewModelWorkspace.refreshWorkspaces(userId);
          notifications.success("You left a team.");
          handleLeaveTeamModal();
          isShowMoreVisible = false;
          isLeavingTeam = false;
        }, 500);
      }, 500);
    } else {
      notifications.error(
        response.message ?? "Failed to leave the team. Please try again.",
      );
      isShowMoreVisible = false;
      isLeavingTeam = false;
      handleLeaveTeamModal();
    }
  };

  const handleCreateTeamModal = () => {
    isCreateTeamModalOpen = !isCreateTeamModalOpen;
    newTeam = {
      name: {
        value: "",
        invalid: false,
      },
      description: {
        value: "",
        invalid: false,
      },
      file: {
        value: [],
        invalid: false,
        showFileSizeError: false,
        showFileTypeError: false,
      },
    };
  };

  const handleTeamNameChange = (e: any) => {
    if (e.target.value !== "") {
      newTeam.name.invalid = false;
    }
    newTeam.name.value = e.target.value;
  };

  const handleTeamDescChange = (e: any) => {
    newTeam.description.value = e.target.value;
  };

  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    if (
      (e?.target?.files && e?.target?.files[0].size > maxSize * 1024) ||
      (e?.dataTransfer?.files &&
        e?.dataTransfer?.files[0].size > maxSize * 1024)
    ) {
      newTeam.file.showFileSizeError = true;
      newTeam.file.invalid = true;
      return;
    }
    const fileType = `.${(
      (e?.target?.files && e?.target?.files[0]?.name) ||
      (e?.dataTransfer?.files && e?.dataTransfer?.files[0]?.name)
    )
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      newTeam.file.showFileTypeError = true;
      newTeam.file.invalid = true;
      return;
    }
    newTeam.file.showFileSizeError = false;
    newTeam.file.showFileTypeError = false;
    newTeam.file.invalid = false;
    newTeam.file.value =
      (e?.target?.files && e?.target?.files[0]) ||
      (e?.dataTransfer?.files && e?.dataTransfer?.files[0]);
  };

  const handleLogoReset = (e: any) => {
    newTeam.file.value = [];
  };

  const handleLogoEdit = (e: any) => {
    const fileInput = document.getElementById("team-file-input");
    // fileInput.click();
  };

  const handleOnShowMoreClick = () => {
    isShowMoreVisible = true;
  };

  const handleCloseShowMoreClick = () => {
    isShowMoreVisible = false;
  };

  const handleLeaveTeamModal = () => {
    leaveTeamName = $openTeam?.name;
    openLeaveTeamModal = !openLeaveTeamModal;
  };

  onMount(async () => {
    newTeam = {
      name: {
        value: "",
        invalid: false,
      },
      description: {
        value: "",
        invalid: false,
      },
      file: {
        value: [],
        invalid: false,
        showFileSizeError: false,
        showFileTypeError: false,
      },
    };
    refreshTeamsWorkspaces(userId);
  });

  let splitter;
  onMount(() => {
    splitter = document.querySelector(
      ".splitter-sidebar .splitpanes__splitter",
    );
    // splitter.style.width = "1px";
  });

  onDestroy(() => {
    userSubscribe();
    teamSubscribe.unsubscribe();
    activeTeamSubscribe.unsubscribe();
  });
  let teamUnderSubmission: boolean = false;
</script>

<svelte:window
  on:click={(e) => {
    handleCloseShowMoreClick();
  }}
  on:contextmenu|preventDefault={() => {
    handleCloseShowMoreClick();
  }}
/>
<!-- Create New Team POP UP -->

<Modal
  title={"New Team"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isCreateTeamModalOpen}
  handleModalState={(flag) => {
    handleCreateTeamModal();
  }}
>
  <!-- <Input
    value={newTeam.name.value}
    inputId="team-name-input"
    labelText="Team or Organization name"
    inputPlaceholder="Please enter your team name"
    isRequired={true}
    onChange={handleTeamNameChange}
    invalidValue={newTeam.name.invalid}
    errorText={"Team name cannot be empty."}
    type={"input"}
    inputStyleProp={"border: 1px solid var(--border-color);"}
    inputClassProp={`py-2 px-3`}
    labelTextClassProp={`mt-3`}
  />
  <Input
    maxCharacter={500}
    value={newTeam.description.value}
    labelText="About"
    labelDescription={newTeam.description.value !== ""
      ? `${Math.max(0, 500 - newTeam.description.value.length)} characters left`
      : "max: 500 characters"}
    inputId="team-desc-input"
    inputPlaceholder="Write a little about your team"
    onChange={handleTeamDescChange}
    type={"textarea"}
    inputClassProp={`py-2 px-3 border-0`}
    labelTextClassProp={`mt-3`}
  /> -->
  <DragDrop
    value={newTeam.file.value}
    maxFileSize={100}
    onChange={handleLogoInputChange}
    resetValue={handleLogoReset}
    editValue={handleLogoEdit}
    labelText="Logo"
    labelDescription="Drag and drop your image. We recommend that you upload an image with square aspect ratio.The image size should not be more than 100 KB. Supported formats are .jpg, .jpeg, .png "
    inputId="team-file-input"
    inputPlaceholder="Drag and Drop or"
    isRequired={false}
    supportedFileTypes={[".png", ".jpg", ".jpeg"]}
    showFileSizeError={newTeam.file.showFileSizeError}
    showFileTypeError={newTeam.file.showFileTypeError}
    type={"image"}
    fileTypeError="This file type is not supported. Please reupload in any of the following file formats."
    fileSizeError="The size of the file you are trying to upload is more than 100 KB."
  />
  <div class="sparrow-modal-footer d-flex justify-content-end mt-4">
    <Button
      disable={teamUnderSubmission}
      title={`Cancel`}
      type="dark"
      buttonClassProp={`me-2`}
      onClick={handleCreateTeamModal}
    />
    <Button
      title={"Create Team"}
      type="primary"
      disable={teamUnderSubmission}
      loader={teamUnderSubmission}
      buttonClassProp={`me-1`}
      onClick={async () => {
        teamUnderSubmission = true;
        await handleCreateTeam(
          newTeam.name.value,
          newTeam.description.value,
          newTeam.file.value,
        );
        teamUnderSubmission = false;
      }}
    />
  </div>
</Modal>

<!-- Leave Team POP UP -->

<Modal
  title={"Leave Team?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={openLeaveTeamModal}
  handleModalState={(flag) => {
    handleLeaveTeamModal();
  }}
>
  <p class="warning-text text-lightGray mt-3 mw-50 text-wrap">
    Are you sure you want to leave team <span class="fw-semibold"
      >"{leaveTeamName || ""}"</span
    >? You will lose access to all the resources in this team.
  </p>
  <div class="sparrow-modal-footer d-flex justify-content-end mt-4">
    <Button
      disable={isLeavingTeam}
      title={`Cancel`}
      type="dark"
      buttonClassProp={`me-2`}
      onClick={handleLeaveTeamModal}
    />
    <Button
      title={"Leave"}
      type="danger"
      disable={isLeavingTeam}
      loader={isLeavingTeam}
      buttonClassProp={`me-1`}
      onClick={async () => {
        handleLeaveTeam();
      }}
    />
  </div>
</Modal>

<Splitpanes
  class="splitter-sidebar"
  on:resize={(e) => {
    // workspaceLeftPanelWidth.set(e.detail[0].size);
    // workspaceRightPanelWidth.set(e.detail[1].size);
  }}
>
  <!-- <Pane class="sidebar-left-panel" minSize={20} size={$workspaceLeftPanelWidth}> -->
  <!-- <WorkspaceList
      {userId}
      {handleCreateTeamModal}
      openTeam={$openTeam}
      teams={allTeams}
      {data}
      tabList={$tabList}
      collectionList={$collectionList}
      {handleWorkspaceSwitch}
      {handleWorkspaceTab}
      {activeSideBarTabMethods}
      {teamRepositoryMethods}
      {teamServiceMethods}
      {collectionsMethods}
    /> -->
  <!-- </Pane> -->
  <!-- <Pane
    class="sidebar-right-panel"
    minSize={60}
    size={$workspaceRightPanelWidth}
  > -->
  <!-- <WorkspaceContent
      {currentTeam}
      {userId}
      teams={allTeams}
      {handleCreateWorkspace}
      {handleWorkspaceSwitch}
      {handleWorkspaceTab}
      {data}
      {activeSideBarTabMethods}
      {isShowMoreVisible}
      {handleCloseShowMoreClick}
      {handleLeaveTeamModal}
      {handleOnShowMoreClick}
      {workspaceUnderCreation}
      openTeam={$openTeam}
      {teamServiceMethods}
      {teamRepositoryMethods}
      workspaces={$workspaces}
    /> -->
  <!-- </Pane> -->
</Splitpanes>

<style>
  .warning-text {
    color: var(--colors-neutral-text-3, #ccc);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }
  :global(.splitter-sidebar.splitpanes) {
    width: calc(100vw - 72px);
  }
</style>
