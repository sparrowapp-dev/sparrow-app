<script lang="ts">
  import { Events, WorkspaceRole } from "@sparrow/common/enums";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { generatingImage } from "@sparrow/common/images";
  import { TextEditor } from "@sparrow/library/forms";
  import { AISuggestionBox } from "../../../../features/chat-bot/components";
  import { policyConfig } from "@sparrow/common/store";

  export let onUpdateRequestDescription;
  export let isDocGenerating = false;
  export let isDocAlreadyGenerated = false;
  export let onGenerateDocumentation;
  export let isGuestUser;
  export let requestDoc: string;
  export let userRole;

  const sendPrompt = async (text: string) => {
    if (text) {
      await onGenerateDocumentation(text, "", "");
    }
  };
</script>

<div class=" text-fs-14">
  <div
    style="height: 100%; min-height:160px;background-color: var(--bg-ds-surface-600);border-radius:4px;padding:8px;display:flex;flex-direction:column;gap:4px;"
    class="area"
  >
    <div on:keydown|stopPropagation on:keyup|stopPropagation>
      <div
        id="editor2"
        style={isDocGenerating ? "pointer-events: none !important; " : ""}
      >
        <TextEditor
          placeholder={"Add documentation; insert / to see all the options."}
          id={"editor2"}
          onInput={onUpdateRequestDescription}
          value={requestDoc}
          isReadOnly={isDocGenerating ||
          userRole === WorkspaceRole.WORKSPACE_VIEWER
            ? true
            : false}
        />
      </div>
    </div>
    {#if !isGuestUser && $policyConfig.enableAIAssistance && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <div class="" style=" width: 100%;">
        <div style="width:fit-content; ">
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
    {/if}
  </div>
</div>

<style>
  .area:hover {
    border: 1px solid var(--border-primary-300) !important;
  }
  .area:hover {
    background-color: var(--bg-secondary-450) !important;
  }
  .area::selection {
    background-color: black !important;
  }
</style>
