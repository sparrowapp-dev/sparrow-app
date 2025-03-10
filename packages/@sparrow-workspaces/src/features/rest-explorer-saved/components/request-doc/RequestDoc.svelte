<script lang="ts">
  import { Events } from "@sparrow/common/enums";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { generatingImage } from "@sparrow/common/images";
  import { TextEditor } from "@sparrow/library/forms";
  import { AISuggestionBox } from "../../../chat-bot/components";

  export let onUpdateRequestDescription;
  export let isDocGenerating = false;
  export let isDocAlreadyGenerated = false;
  export let onGenerateDocumentation;
  export let isGuestUser;
  export let requestDoc: string;

  const sendPrompt = async (text: string) => {
    if (text) {
      await onGenerateDocumentation(text, "", "");
    }
  };
</script>

<div class=" text-fs-14">
  <!-- <div class="d-flex" style="justify-content: space-between; margin-top: 10px;">
    <div style="font-weight: 600; margin-bottom:8px;">Documentation</div>
  </div> -->
  <div
    style="height: 100%; min-height:160px; background-color: var(--bg-ds-surface-600);border-radius:4px;padding:8px"
    class="area"
  >
    <div on:keydown|stopPropagation on:keyup|stopPropagation>
      <div
        id="editor2"
        style={isDocGenerating ? "pointer-events: none !important; " : ""}
      >
        <TextEditor
          placeholder={"Add documentation"}
          id={"editor2"}
          onInput={onUpdateRequestDescription}
          value={requestDoc}
          isReadOnly={isDocGenerating ? true : false}
        />
      </div>
    </div>
    <div></div>
  </div>
</div>

<style>
  /* .area:hover {
    border: 1px solid var(--border-primary-300) !important;
  }
  .area:hover {
    background-color: var(--bg-secondary-450) !important;
  }
  .area::selection {
    background-color: black !important;
  } */
</style>
