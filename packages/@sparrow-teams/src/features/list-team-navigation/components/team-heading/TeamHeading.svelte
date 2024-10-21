<script>
  export let openTeam;
  import { base64ToURL } from "@sparrow/common/utils";
</script>

<div class="d-flex align-items-center p-3 pb-0">
  <span>
    {#if openTeam?.logo?.size}
      <img
        class="text-center w-25 align-items-center justify-content-center profile-circle bg-dullBackground"
        style="width: 40px !important; height: 40px !important; padding-top: 2px; display: flex; border-radius: 50%;"
        src={base64ToURL(openTeam?.logo)}
        alt=""
      />{:else}
      <p
        class={`d-flex text-defaultColor w-25 text-center my-auto align-items-center justify-content-center profile-circle bg-tertiary-750 border-secondary-300 border-2`}
        style={`font-size: 12px; padding-top: 2px; width: 25px !important; height: 25px !important; display: flex; border: 2px solid #45494D;border-radius: 50%;`}
      >
        <span> {openTeam?.name[0] ? openTeam?.name[0].toUpperCase() : ""}</span>
      </p>
    {/if}
  </span>
  <span class="ms-2">
    {openTeam?.name}
  </span>
</div>
