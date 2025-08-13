<script lang="ts">
  import { Button } from "@sparrow/library/ui";
  import { TabularInputV2 } from "../../../components";
  import GenerateVariablesLoading from "../components/GenerateVariablesLoading.svelte";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  export let currentEnvironment: any;
  export let generatedVariables: KeyValuePair[] = [];
  export let isReGenerateVariable: boolean = false;
  export let isLoadingVariables: boolean = true;
  export let isAcceptedVariables: boolean = false;
  export let updateGeneratedVariables;

  export let onUpdateVariableSelection;
  export let aiGenerationStatus:
    | "generating"
    | "regenerating"
    | "accepted"
    | "rejected"
    | "generated" = "";
</script>

<div class="flex flex-column" style="margin-top: 12px;">
  <div>
    <p
      class="d-flex justify-content-start align-items-center common-text title-text"
      style="margin: 0px; padding:8px;"
    >
      Generated Variables from "{currentEnvironment?.generateProperty
        .collectionName}"
    </p>
    <p
      class="d-flex justify-content-start align-items-center common-text description-text"
    >
      The data in your requests will be updated once you accept and save the
      environment.
    </p>
  </div>
  <div>
    {#if aiGenerationStatus === "generating"}
      <div class="d-flex flex-column">
        <div class="" style="margin-top: 16px; margin-bottom:12px;">
          <TabularInputV2
            disabled={false}
            keyValue={[]}
            callback={() => {}}
            search={""}
            isGeneratedVariable={true}
          />
        </div>
        <div class="">
          <GenerateVariablesLoading />
        </div>
      </div>
    {:else if aiGenerationStatus === "generated"}
      <div class="d-flex">
        <TabularInputV2
          disabled={false}
          keyValue={generatedVariables}
          callback={updateGeneratedVariables}
          search={""}
          isGeneratedVariable={true}
          {onUpdateVariableSelection}
        />
      </div>
    {:else if aiGenerationStatus === "accepted"}
      <div class="d-flex flex-column">
        <div class="" style="margin-top: 16px; margin-bottom:12px;">
          <TabularInputV2
            disabled={false}
            keyValue={[]}
            callback={() => {}}
            search={""}
            isGeneratedVariable={true}
          />
        </div>
        <div class="" style="margin-top: 24px;">
          <p
            class="d-flex justify-content-center align-items-center common-text title-text"
            style="margin: 0px;"
          >
            Ready to Save!
          </p>
          <p
            class="d-flex justify-content-center align-items-center common-text description-text"
          >
            Accepted suggestions have been added to your 'Global Variables'
            environment. Click on Save button to apply these changes
            permanently.
          </p>
        </div>
      </div>
    {:else if aiGenerationStatus === "rejected"}
      <div class="d-flex flex-column">
        <div class="" style="margin-top: 16px; margin-bottom:12px;">
          <TabularInputV2
            disabled={false}
            keyValue={[]}
            callback={() => {}}
            search={""}
            isGeneratedVariable={true}
            isCheckBoxNotRequired={true}
          />
        </div>
        <div class="" style="margin-top: 24px;">
          <p
            class="d-flex justify-content-center align-items-center common-text title-text"
            style="margin: 0px;"
          >
            No Variables
          </p>
          <p
            class="d-flex justify-content-center align-items-center common-text description-text"
          >
            You have reviewed and cleared all the suggestions for this
            collection. Your environment has not been changed.
          </p>
          <div class="d-flex justify-content-center" style="margin-top: 30px;">
            <Button
              type="outline-primary"
              onClick={async () =>
                await onUpdateVariableSelection("regenerate")}
              title="Re-Generate Variables"
              size="medium"
            />
          </div>
        </div>
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
