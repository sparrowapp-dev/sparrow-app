<script lang="ts">
  import { Events } from "$lib/utils/enums";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { generatingImage } from "@common/images";
  import { AISuggestionBox } from "@workspaces/features/chat-bot/components";
  export let onUpdateRequestDescription;
  export let isDocGenerating = false;
  export let isDocAlreadyGenerated = false;
  export let requestDoc: string;
  export let onGenerateDocumentation;

  const sendPrompt = async (text: string) => {
    if (text) {
      const response = await onGenerateDocumentation(text, "", "");
    }
  };
</script>

<div class=" text-fs-14">
  <div class="d-flex" style="justify-content: space-between;">
    <div style="font-weight: 600; margin-bottom:8px;">Documentation</div>
  </div>
  <div style="height: 160px !important; " class="area">
    <textarea
      bind:value={requestDoc}
      on:input={() => {
        onUpdateRequestDescription(requestDoc);
      }}
      class="text-fs-12 w-100 border-0"
      style="height:120px !important; font-weight:400; background-color:transparent; outline: none;   padding-bottom:5px; padding-top: 8px; padding-left: 12px; padding-right: 12px;"
      placeholder="Add Documentation"
    ></textarea>
    <div
      class=""
      style="height: 42px; width: 100%;margin-top:-6px; padding-bottom:8px; padding-left:8px; "
    >
      <div style="width:fit-content; margin-top:6px; ">
        {#if isDocGenerating == true}
          <div
            class="text-primary-300 mt-1"
            style="font-size: 14px; height: 20px; width:auto;"
          >
            <img
              style="height: 30px; width:auto;"
              src={generatingImage}
              alt="generating"
            />
          </div>
        {:else if isDocAlreadyGenerated == false}
          <AISuggestionBox
            onClick={(text = "") => {
              ("Generate Documentation for api request, don't give response in markdown format");
              sendPrompt(text);
              MixpanelEvent(Events.AI_Generate_Doc);
            }}
            title={"Generate Documentation"}
          />
        {:else if isDocAlreadyGenerated == true}
          <AISuggestionBox
            onClick={(text = "") => {
              text =
                "Re-Generate Documentation for api request, don't give response in markdown format. Make it better.";
              sendPrompt(text);
              MixpanelEvent(Events.AI_Regenerate_Doc);
            }}
            title={"Regenerate"}
          />
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .area:focus-within {
    border: 1px solid var(--border-primary-300) !important;
  }
  .area:hover {
    background-color: var(--bg-secondary-450) !important;
  }
</style>
