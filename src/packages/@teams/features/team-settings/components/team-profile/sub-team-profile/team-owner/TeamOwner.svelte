<script>
  import { OWNER_CONFIG } from "../../../../constants";
  export let ownerDetails;
</script>

<div class="title-width">
  <p class="team-title fs-12 text-textColor">{OWNER_CONFIG.TITLE}</p>
</div>
<div class="col-10">
  <p class="ps-3 text-fs-12">
    {ownerDetails.name} <span class="text-textColor px-2">|</span>
    {ownerDetails.email}
  </p>
</div>

<style>
  .fs-12 {
    font-size: 12px;
  }
  .title-width {
    width: 90px;
  }
</style>
