<script lang="ts">
  import { TabularInputV2 } from "../../../components";
  import GenerateVariablesLoading from "../components/GenerateVariablesLoading.svelte";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  export let collection: any;
  export let generatedVariables: KeyValuePair[] = [];

  export let isLoadingVariables: boolean = true;
</script>

<div class="flex flex-column" style="margin-top: 12px;">
  <div>
    <p
      class="d-flex justify-content-start align-items-center common-text title-text"
      style="margin: 0px; padding:8px;"
    >
      Generated Variables from "{collection?.collectionName}"
    </p>
    <p
      class="d-flex justify-content-start align-items-center common-text description-text"
    >
      The data in your requests will be updated once you accept and save the
      environment.
    </p>
  </div>
  <div>
    {#if isLoadingVariables}
      <div class="d-flex flex-column">
        <div class="" style="margin-top: 16px; margin-bottom:12px;">
          <TabularInputV2
            disabled={false}
            keyValue={[]}
            callback={() => {}}
            search={""}
            isCheckBoxNotRequired={true}
          />
        </div>
        <div class="">
          <GenerateVariablesLoading />
        </div>
      </div>
    {:else}
      <div class="d-flex">
        <TabularInputV2
          disabled={false}
          keyValue={generatedVariables}
          callback={() => {
            console.log("----------this is the variables we are inserting.");
          }}
          search={""}
          isGeneratedVariable={true}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .title-text {
    font-size: 16px;
    color: var(--text-ds-neutral-50);
  }
  .description-text {
    font-size: 12px;
    color: var(--text-ds-neutral-200);
    margin: 10px 0 0 8px;
  }
  .common-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    line-height: 150%;
    letter-spacing: 0;
    text-align: left;
  }
</style>
