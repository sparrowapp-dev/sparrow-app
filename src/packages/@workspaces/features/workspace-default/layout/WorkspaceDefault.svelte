<script>
  import { VectorIcon, LibraryIcon } from "@library/icons";
  import SparrowLogo from "@workspaces/features/rest-explorer/assets/images/sparrow-logo.svelte";
  export let showImportCollectionPopup;
  export let onItemCreated;
  export let showContainer = true;
  export let isGuidePopup = false;
</script>


<div
  class=" d-flex flex-column justify-content-center align-items-center"
  style=" padding-top: 70px; padding-right:325px;  padding-left:325px; padding-bottom: 24px; gap: 89px;"
>
  <div style="height: 176px; width: 175px;">
    <SparrowLogo />
  </div>
  <div class="d-flex" style="gap: 19px;">
    <div
      class=" "
      style="height: 120px; width:120px; border: 0.5px solid var(--text-tertiary-400 ); border-radius : 4px;"
      role="button"
      on:click={() => {
        showImportCollectionPopup();
      }}
    >
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 79px"
      >
        <LibraryIcon
          width="24px"
          height="24px"
          color=" var( --text-primary-300)"
        />
      </div>
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 41px; background-color:var(--text-tertiary-400 ); padding:10px; font-size:14px; "
      >
        Add Collection
      </div>
    </div>

    <div
      class=" "
      style="height: 120px; width:120px; border: 0.5px solid var(--text-tertiary-400 );  border-radius : 4px; "
      role="button"
      on:click={() => {
        onItemCreated("request", {});
      }}
    >
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 79px"
      >
        <VectorIcon
          width="24px"
          height="24px"
          color=" var( --text-primary-300)"
        />
      </div>
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 41px; background-color:var(--text-tertiary-400 ); padding:10px; font-size:14px;  "
      >
        Add Request
      </div>
    </div>
  </div>
</div>
