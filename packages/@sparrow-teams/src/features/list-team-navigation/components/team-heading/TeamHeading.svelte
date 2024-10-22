<script>
  export let openTeam;
  import { base64ToURL } from "@sparrow/common/utils";
  import { PeopleIcon } from "@sparrow/library/assets";
</script>

<div class="d-flex align-items-center p-3 pt-4 pb-0">
  <div class="d-flex align-items-center" style="width: calc(100% - 20px);">
    <span class="team-icon ms-2 me-2">
      {#if openTeam?.logo?.size}
        <img
          class="text-center align-items-center justify-content-center profile-circle bg-dullBackground"
          style="width: 20px !important; height: 20px !important; padding-top: 2px; display: flex; border-radius: 50%;"
          src={base64ToURL(openTeam?.logo)}
          alt=""
        />{:else}
        <div
          class={`d-flex text-defaultColor text-center my-auto align-items-center justify-content-center profile-circle bg-tertiary-750 border-secondary-300`}
          style={`padding-top: 2px; width: 20px !important; height: 20px !important; display: flex; border: 1px solid #45494D; border-radius: 50%;`}
        >
          <span class="text-fs-12 fw-bold" style="margin-top:-4px;">
            {openTeam?.name[0] ? openTeam?.name[0]?.toUpperCase() : ""}</span
          >
        </div>
      {/if}
    </span>
    <span
      class="ms-2 fw-bold ellipsis text-secondary-100"
      style="margin-top:-5px;"
    >
      {openTeam?.name || ""}
    </span>
  </div>
  <div style="width:20px;" class="d-flex align-items-center">
    <PeopleIcon
      color={"var(--icon-secondary-200)"}
      classProp={openTeam?.users?.length <= 1 && "d-none"}
    />
  </div>
</div>
