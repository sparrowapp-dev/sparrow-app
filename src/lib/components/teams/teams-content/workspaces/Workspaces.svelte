<script lang="ts">
  //   import WorkspaceCard from "$lib/components/dashboard/workspace-card/WorkspaceCard.svelte";
  import PersonalWorkspace from "$lib/components/table/personal-workspace/PersonalWorkspace.svelte";
  //   import TeamsWorkspace from "$lib/components/table/teams-workspace/TeamsWorkspace.svelte";
  export let data: any;
  export let selectedView: string;
</script>

{#if selectedView === "grid"}
  <!-- <section class="teams-workspace">
    <div class="container-fluid">
      <div class="row"> -->
  <!-- {#each projects as project} -->
  <!-- <WorkspaceCard project = {project} /> -->
  <!-- {/each}
        <div class="col-6 pb-4">
          <div
            class="teams-add-workspace rounded p-5 d-flex align-items-center justify-content-center"
          >
            <p class="mb-0">+ Add New Workspace</p>
          </div>
        </div>
      </div>
    </div>
  </section> -->
{:else}
  <section class="teams-workspace">
    <div class="container-fluid bg-backgroundColor">
      <div class="row">
        <div class="col-12 bg-backgroundColor">
          <PersonalWorkspace {data} />
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  /* .teams-add-workspace {
    border: 1px dashed;
    border-image-source: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    border-image-slice: 1;
    cursor: pointer;
  }
  .teams-add-workspace p {
    background-color: red;
    background-image: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    background-size: 100%;
    background-repeat: repeat;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -moz-background-clip: text;
    -moz-text-fill-color: transparent;
  } */
</style>
