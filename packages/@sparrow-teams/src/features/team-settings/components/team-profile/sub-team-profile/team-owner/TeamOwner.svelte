<script>
  import { OWNER_CONFIG } from "../../../../constants";
  export let ownerDetails;
</script>

<div class="d-flex flex-column pb-3">
  <div class="title-width">
    <p class="team-title mb-0 fs-12 text-textColor">{OWNER_CONFIG.TITLE}</p>
  </div>
  <div
    class="container-width"
    style="background-color: var(--bg-ds-surface-600);display:flex;align-items:center; margin-top:4px"
    tabindex="0"
  >
    <p class="ps-2 mb-0 text-fs-12">
      <!-- {ownerDetails.name} <span class="text-textColor px-2">|</span> -->
      <span style="color: var(--text-ds-neutral-500);"
        >{ownerDetails.email}</span
      >
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
    border-radius: 4px;
    width: 398px;
    height: 34px;
  }
</style>
