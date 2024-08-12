<script>
  import { VectorIcon, LibraryIcon, StackIcon } from "@library/icons";
  import PlusIcon from "@library/icons/PlusIcon.svelte";
  import SparrowLogo from "@workspaces/features/rest-explorer/assets/images/sparrow-logo.svelte";
  export let showImportCollectionPopup;
  export let onItemCreated;
  export let isGuestUser = false;
  export let handleCreateEnvironment;
</script>

<div
  class="d-flex flex-column align-items-center h-100 "
  style="padding-top: 124px; padding-right:325px; padding-left:325px; padding-bottom: 24px; overflow:auto;"
>
  <div style="height: 176px; width: 175px; margin-bottom: 24px;">
    <SparrowLogo />
  </div>
  <div class="d-flex" style="gap: 19px;">
    {#if isGuestUser !== true}
      <div
        class=""
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
          <span><PlusIcon color={"var(--white-color)"} /></span>Collection
        </div>
      </div>
    {/if}

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
        <span><PlusIcon color={"var(--white-color)"} /></span> Request
      </div>
    </div>

    <div
      class=" "
      style="height: 120px; width:120px; border: 0.5px solid var(--text-tertiary-400 );  border-radius : 4px; "
      role="button"
      on:click={handleCreateEnvironment}
    >
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 79px"
      >
        <StackIcon
          width="24px"
          height="24px"
          color=" var( --text-primary-300)"
        />
      </div>
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 41px; background-color:var(--text-tertiary-400 ); padding:10px; font-size:14px;  "
      >
        <span><PlusIcon color={"var(--white-color)"} /></span> Environment
      </div>
    </div>
  </div>
</div>
