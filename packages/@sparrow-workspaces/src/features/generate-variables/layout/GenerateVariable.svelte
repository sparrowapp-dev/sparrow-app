<script lang="ts">
  import { Button } from "@sparrow/library/ui";
  import { TabularInputV2 } from "../../../components";
  import GenerateVariablesLoading from "../components/GenerateVariablesLoading.svelte";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import { ChevronDownRegular, ChevronUpRegular } from "@sparrow/library/icons";
  export let currentEnvironment: any;
  export let generatedVariables: KeyValuePair[] = [];
  export let isReGenerateVariable: boolean = false;
  export let isLoadingVariables: boolean = true;
  export let isAcceptedVariables: boolean = false;
  export let updateGeneratedVariables;
  export let handleRedirectToDocs = () => {};
  export let isWebApp;

  export let onUpdateVariableSelection;
  export let aiGenerationStatus:
    | "generating"
    | "regenerating"
    | "accepted"
    | "rejected"
    | "generated"
    | "empty" = "";
  let showMoreInfo: boolean = false;

  const toggleMoreInfo = () => {
    showMoreInfo = !showMoreInfo;
  };
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
    {:else if aiGenerationStatus === "empty"}
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
        <div
          class="d-flex flex-column justify-content-center align-items-center"
          style="margin-top: 2px;"
        >
          <p
            class="d-flex justify-content-center align-items-center common-text title-text"
            style="margin: 0px;"
          >
            Nothing to Suggest
          </p>
          <p
            class="d-flex justify-content-center align-items-center common-text description-text"
          >
            We scanned the "Manage Pets" collection and didn't find any
            repeating values to suggest as
          </p>
          <p
            class="d-flex justify-content-center align-items-center common-text description-text"
          >
            variables. This means your collection is already well-organized.
            <Button
              type="link-primary"
              onClick={toggleMoreInfo}
              title="More Info"
              size="small"
              endIcon={showMoreInfo ? ChevronDownRegular : ChevronUpRegular}
            />
          </p>
          {#if showMoreInfo}
            <div
              class="d-flex flex-column justify-content-center align-items-center"
              style="
        border: 0.5px solid var(--border-ds-neutral-100);
        border-radius: 10px;
        background-color: var(--bg-ds-surface-800);
        width:770px;
      "
            >
              <ul
                class="common-text description-text"
                style="margin-bottom: 5px;"
              >
                <li>
                  Using a common URL across your requests is the number one way
                  for Sparrow to spot a potential variable.
                </li>
                <li>
                  If your collection includes APIs from different services,
                  consider splitting them into separate collections for more
                  accurate suggestions within the same workspace.
                </li>
                <li>
                  Our documentation has a full guide on how this feature works
                  and how you can use it.
                  <a
                    on:click={handleRedirectToDocs}
                    style="color: var(--text-ds-primary-300); cursor: pointer; text-decoration: underline;"
                    >See How It Works</a
                  >
                </li>
                {#if !isWebApp}
                  <li>
                    Have an idea on how to make this feature better? We'd love
                    to hear from you.
                    <a
                      style="color: var(--text-ds-primary-300); cursor: pointer; text-decoration: underline;"
                    >
                      Help Us Improve
                    </a>
                  </li>
                {/if}
              </ul>
            </div>
          {/if}
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
