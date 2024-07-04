<script lang="ts">
  import { Input } from "@library/forms";
  import { Button, Tooltip } from "@library/ui";
  import { Shimmer } from "../images";

  let search = "";
  export let modifiedUser;
  export let workspaceName;
</script>

<div class="workspace-setting" style="padding:24px;  height:100dvh;">
  <div
    class="d-flex"
    style=" justify-content:space-between; gap:15px; height:30px;"
  >
    <div
      style="font-weight: 700; font-size:18px; color:var(--text-secondary-100);"
    >
      {workspaceName}
    </div>
    <div class="d-flex gap-2">
      <Tooltip title={"Coming Soon"} placement={"bottom"} distance={10}>
        <Button
          type={"dark"}
          title={"Delete Workspace"}
          textClassProp={"fs-12 "}
          textStyleProp={"font-weight:400; font-size:12px;"}
          disable={"true"}>Delete Workspace</Button
        >
      </Tooltip>

      <Tooltip title={"Coming Soon"} placement={"bottom"} distance={10}>
        <Button
          type={"primary"}
          title={"Invite"}
          textClassProp={""}
          textStyleProp={"font-weight:400; font-size:12px;"}
          disable={"true"}>Invite</Button
        >
      </Tooltip>
    </div>
  </div>

  <div class="d-flex flex-column" style="">
    <div class="pt-2">
      <Input
        class="search-area text-fs-12 rounded p-2"
        type="search"
        bind:value={search}
        on:input={() => {}}
        width={"300px"}
        style="outline:none; width:358px; font-size:12px !important; height:32px; border:none; background-color: var(--bg-tertiary-250); border-radius:4px;"
        placeholder="Search People in my workspace"
        defaultBorderColor="transparent"
        hoveredBorderColor={"var(--border-primary-300)"}
        focusedBorderColor={"var(--border-primary-300)"}
      />
    </div>
    <div
      class="d-flex align-items-center"
      style="height: 46px; width:100%; margin-top:24px; margin-bottom:8px;"
    >
      <div
        class="rounded-5 me-2 border border-defaultColor d-flex justify-content-center align-items-center"
        style="height: 32px; width: 32px;"
      >
        {modifiedUser?.name[0]}
      </div>
      <div class="d-flex flex-column" style="width: 420px; font-size:12px; ">
        <div style="color: var(--text-secondary-100);">
          {modifiedUser?.name} (You)
        </div>
        <div style="color: var(--text-secondary-200) ;">
          {modifiedUser?.email}
        </div>
      </div>
      <div
        style="color: var(--text-secondary-100); marging-left:auto; font-size:12px;"
      >
        Owner
      </div>
    </div>
    <div
      style="width: 100%; border-bottom:2px solid #313233;  padding-bottom:8px;"
    ></div>
    <img
      src={Shimmer}
      alt="shimmer effect"
      width="100%"
      height="100%"
      style="margin-left: -5px; margin-top:8px;"
    />
  </div>
</div>
