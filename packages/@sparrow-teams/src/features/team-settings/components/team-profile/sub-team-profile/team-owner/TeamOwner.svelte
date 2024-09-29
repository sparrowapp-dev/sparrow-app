<script>
  import { OWNER_CONFIG } from "../../../../constants";
  export let ownerDetails;
</script>

<div class="d-flex pb-3">
  <div class="title-width">
    <p class="team-title mb-0 fs-12 text-textColor">{OWNER_CONFIG.TITLE}</p>
  </div>
  <div class="container-width">
    <p class="ps-2 mb-0 text-fs-12">
      {ownerDetails.name} <span class="text-textColor px-2">|</span>
      {ownerDetails.email}
    </p>
  </div>
</div>

<style>
  .fs-12 {
    font-size: 12px;
  }
  .title-width {
    width: 98px;
  }
  .container-width {
    width: calc(100% - 98px);
  }
</style>
