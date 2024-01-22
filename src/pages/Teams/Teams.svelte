<script lang="ts">
  import type { Observable } from "rxjs";
  import type { TeamDocument } from "$lib/database/app.database";
  import type {
    CollectionsMethods,
    CurrentTeam,
    WorkspaceMethods,
  } from "$lib/utils/interfaces";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import WorkspaceContent from "../../lib/components/workspace/WorkspaceContent.svelte";
  import WorkspaceList from "../../lib/components/workspace/workspace-list/WorkspaceList.svelte";
  import { TeamViewModel } from "./team.viewModel";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { Motion } from "svelte-motion";
  import { onDestroy, onMount } from "svelte";
  import {
    isTeamCreatedFirstTime,
    openedTeam,
    setOpenedTeam,
  } from "$lib/store/team.store";
  import {
    isWorkspaceCreatedFirstTime,
    isWorkspaceLoaded,
    user,
  } from "$lib/store";
  import {
    generateSamepleTeam,
    generateSampleWorkspace,
  } from "$lib/utils/sample";
  import { UntrackedItems } from "$lib/utils/enums";
  import { moveNavigation } from "$lib/utils/helpers";
  import { navigate } from "svelte-navigator";
  import { notifications } from "$lib/utils/notifications";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import {
    ParaInput,
    FileInput,
    TextInput,
    CustomPopup,
  } from "$lib/components";
  import { v4 as uuidv4 } from "uuid";

  export let data: any;
  export let handleWorkspaceSwitch: any;
  export let handleWorkspaceTab: any;
  export let activeSideBarTabMethods: any;
  export let collectionsMethods: CollectionsMethods;
  export let currentTeam: CurrentTeam;

  let allTeams: any[] = [];
  let userId: string | undefined = undefined;
  let currOpenedTeam: CurrentTeam;
  let activeTeamRxDoc: TeamDocument;

  let workspaceUnderCreation: boolean = false;
  let isCreateTeamModalOpen: boolean;
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
  const _viewModelWorkspace = new HeaderDashboardViewModel();
  const teams: Observable<TeamDocument[]> = _viewModel.teams;
  const activeTeam: Observable<TeamDocument> = _viewModel.activeTeam;
  const tabList = _viewModel.tabs;
  const collectionList = _viewModel.collection;

  const workspaceMethods: WorkspaceMethods = {
    handleCreateTab: _viewModel.handleCreateTab,
  };

  const userSubscribe = user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });

  const openedTeamSubscribe = openedTeam.subscribe((value) => {
    if (value) currOpenedTeam = value;
  });

  const activeTeamSubscribe = activeTeam.subscribe((value: TeamDocument) => {
    if (value) {
      activeTeamRxDoc = value;
      setOpenedTeam(
        currOpenedTeam.id ? currOpenedTeam.id : value.get("teamId"),
        currOpenedTeam.name ? currOpenedTeam.name : value.get("name"),
        currOpenedTeam.base64String
          ? currOpenedTeam.base64String
          : value.get("logo"),
      );
    }
  });

  const isWorkspaceLoadedSubscribe = isWorkspaceLoaded.subscribe(
    (value: boolean) => {
      workspaceUnderCreation = value;
    },
  );

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
    isWorkspaceCreatedFirstTime.set(true);
    isWorkspaceLoaded.set(false);
    const workspaceObj = generateSampleWorkspace(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toISOString(),
    );

    const workspaceData = {
      name: workspaceObj.name,
      id: currOpenedTeam.id,
      createdAt: workspaceObj.createdAt,
    };

    await _viewModel.addWorkspace(workspaceObj);

    const response = await _viewModel.createWorkspace(workspaceData);

    if (response.isSuccessful) {
      await _viewModel.updateWorkspace(workspaceObj.id, response.data.data);

      let totalCollection: number = 0;
      let totalRequest: number = 0;

      $data.map((item) => {
        if (item) {
          if (item._data._id === response.data.data._id) {
            // totalCollection = item?._data?.collections?.length;
            totalCollection = 0;
          } else {
            totalRequest = 0;
          }
        }
      });

      let path: Path = {
        workspaceId: response.data.data._id,
        collectionId: "",
      };

      workspaceObj.id = response.data.data._id;
      workspaceObj.name = response.data.data.name;
      workspaceObj.description = response.data.data?.description;
      workspaceObj.team = {
        teamId: response.data.data?.team?.id,
        teamName: response?.data?.data?.team?.teamName,
      };
      workspaceObj.owner = response.data.data?.owner;
      workspaceObj.users = response.data.data?.users;
      workspaceObj.createdAt = response.data.data?.createdAt;
      workspaceObj.createdBy = response.data.data?.createdBy;
      workspaceObj.isActiveWorkspace = false;
      workspaceObj.environments = response.data.data?.environemnts;
      workspaceObj.path = path;
      workspaceObj.property.workspace.requestCount = totalRequest;
      workspaceObj.property.workspace.collectionCount = 0;
      workspaceObj.save = true;
      // await _viewModelWorkspace.addWorkspace(workspaceObj);
      if (userId) await _viewModelWorkspace.refreshWorkspaces(userId);
      await _viewModelWorkspace.activateWorkspace(workspaceObj.id);
      collectionsMethods.handleCreateTab(workspaceObj);
      collectionsMethods.handleActiveTab(workspaceObj.id);
      moveNavigation("right");
      isWorkspaceCreatedFirstTime.set(true);
      notifications.success("New Workspace Created");
      isWorkspaceLoaded.set(true);
      navigate("/dashboard/collections");
      activeSideBarTabMethods.updateActiveTab("collections");
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
    if (description == "") newTeam.description.invalid = true;
    if (newTeam.file.showFileSizeError || newTeam.file.showFileTypeError)
      return;
    isTeamCreatedFirstTime.set(true);
    const teamObj = generateSamepleTeam(name, description, file, userId);

    await _viewModel.addTeam(teamObj);
    const response = await _viewModel.createTeam(teamObj);

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      // await _viewModel.modifyTeam(teamObj.teamwId, res);
      await _viewModel.refreshTeams(userId);
      notifications.success(`New team ${teamObj.name} is created.`);
      handleCreateTeamModal();
    } else {
      notifications.error("Failed to create a new team.");
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
    if (e.target.files[0].size > maxSize * 1024) {
      newTeam.file.showFileSizeError = true;
      newTeam.file.invalid = true;
      return;
    }
    const fileType = `.${e.target.files[0].name
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
    newTeam.file.value = e.target.files[0];
  };

  const handleLogoReset = (e: any) => {
    newTeam.file.value = [];
  };

  const handleLogoEdit = (e: any) => {
    const fileInput = document.getElementById("team-file-input");
    fileInput.click();
  };

  onMount(() => {
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
  });

  onDestroy(() => {
    userSubscribe();
    openedTeamSubscribe();
    isWorkspaceLoadedSubscribe();
    teamSubscribe.unsubscribe();
    activeTeamSubscribe.unsubscribe();
  });
</script>

<!-- Create New Team POP UP -->
<CustomPopup
  isOpen={isCreateTeamModalOpen}
  title={"New Team"}
  btnText={"Create Team"}
  handleOpen={handleCreateTeamModal}
  handleSubmit={() =>
    handleCreateTeam(
      newTeam.name.value,
      newTeam.description.value,
      newTeam.file.value,
    )}
>
  <TextInput
    value={newTeam.name.value}
    labelText="Team or Organization name"
    inputId="team-name-input"
    inputPlaceholder="Please enter your team name"
    isRequired={true}
    onChange={handleTeamNameChange}
    invalidValue={newTeam.name.invalid}
    errorText={"Team name cannot be empty."}
  />
  <ParaInput
    maxCharacter={500}
    value={newTeam.description.value}
    labelText="About"
    labelDescription={newTeam.description.value !== ""
      ? `${Math.max(0, 500 - newTeam.description.value.length)} characters left`
      : "max: 500 characters"}
    inputId="team-desc-input"
    inputPlaceholder="Write a little about your team"
    onChange={handleTeamDescChange}
  />
  <FileInput
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
    fileTypeError="This file type is not supported. Please reupload in any of the following file formats."
    fileSizeError="The size of the file you are trying to upload is more than 100 KB."
  />
</CustomPopup>

<Motion {...scaleMotionProps} let:motion>
  <div class="workspace bg -backgroundColor" use:motion>
    <WorkspaceList
      {handleCreateTeamModal}
      teams={allTeams}
      {data}
      tabList={$tabList}
      collectionList={$collectionList}
      {handleWorkspaceSwitch}
      {handleWorkspaceTab}
      {activeSideBarTabMethods}
      {collectionsMethods}
    />
    <WorkspaceContent
      {handleCreateWorkspace}
      {userId}
      {currentTeam}
      {handleWorkspaceSwitch}
      {handleWorkspaceTab}
      {data}
      {workspaceMethods}
      {activeSideBarTabMethods}
    />
  </div>
</Motion>

<style>
  .workspace {
    font-size: 12px;
    display: flex;
    top: 44px;
    margin-left: calc(16.5vw + 72px);
    width: calc(79vw - 72px);
    position: fixed;
    height: calc(100% - 44px);
    overflow: auto;
  }

  @media only screen and (max-width: 900px) {
    .workspace {
      margin-left: calc(22vw + 72px);
      width: calc(69vw - 72px);
    }
  }
  .workspace::-webkit-scrollbar {
    width: 2px;
  }
  .workspace::-webkit-scrollbar-thumb {
    background: #888;
  }
</style>
