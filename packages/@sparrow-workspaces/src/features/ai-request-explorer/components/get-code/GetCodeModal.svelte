<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    CodeEditorLanguageType,
    CodeTemplateLanguageType,
  } from "../../types/index";
  import { Sleep } from "@sparrow/common/utils";
  import { modelCodeTemplates } from "../../constants";
  import { Button, notifications } from "@sparrow/library/ui";
  import { Editor, Select } from "@sparrow/library/forms";
  import { CopyRegular, TickIcon } from "@sparrow/library/icons";

  export let currAiRequestInfo;
  export let selectedModelVariant: string;
  export let aiModelProvider: string;
  export let providerApiKey: string;
  export let configurations: any;

  //   const dispatch = createEventDispatcher();

  let codeTemplateLanguage: CodeEditorLanguageType =
    CodeEditorLanguageType.nodejs;
  let selectedCodeTemplateId = CodeTemplateLanguageType.NODEJS;
  let codeTemplate: string;
  let isCodeTemplateBeautified = true;
  let isCodeCopied = false;

  $: {
    if (aiModelProvider && selectedCodeTemplateId) {
      generateCodeTemplate();
    }
  }

  const generateCodeTemplate = () => {
    const templateFunction =
      modelCodeTemplates[aiModelProvider][selectedCodeTemplateId][
        "code_template"
      ];
    codeTemplate = templateFunction(
      selectedModelVariant,
      providerApiKey,
      configurations[aiModelProvider],
    );
    updateCodeTemplateBeautifiedState(true);
  };

  const handleCodeTemplateChange = (
    codeTemplateId: CodeTemplateLanguageType,
  ) => {
    selectedCodeTemplateId = codeTemplateId;
    codeTemplateLanguage = CodeEditorLanguageType[selectedCodeTemplateId];
    generateCodeTemplate();
  };

  const updateCodeTemplateBeautifiedState = (value: boolean) => {
    isCodeTemplateBeautified = value;
  };

  const handleCopyCode = async () => {
    if (isCodeCopied) return;
    try {
      await navigator.clipboard.writeText(codeTemplate);
      isCodeCopied = true;
      notifications.success("Code copied to clipboard.");
      await new Sleep().setTime(5000).exec();
      isCodeCopied = false;
    } catch (err) {
      notifications.error("Failed to copy the code.");
    }
  };
</script>

<div
  class="d-flex align-items-center justify-content-between mt-2 mb-2 w-100 gap-2"
>
  <div class="flex-grow-1" style="max-width: 75%;">
    <Select
      id={"code-selector"}
      data={[
        {
          id: CodeTemplateLanguageType.NODEJS,
          name: "NodeJs",
          disabled: false,
          hide: false,
        },
        {
          id: CodeTemplateLanguageType.JSON,
          name: CodeEditorLanguageType.json,
          disabled: false,
          hide: false,
        },
        {
          id: CodeTemplateLanguageType.PYTHON,
          name: CodeEditorLanguageType.python,
          disabled: false,
          hide: false,
        },
        {
          id: CodeTemplateLanguageType.CURL,
          name: CodeEditorLanguageType.curl,
          disabled: true,
          hide: true,
        },
      ]}
      titleId={selectedCodeTemplateId}
      onclick={(id) => {
        handleCodeTemplateChange(id);
      }}
      menuItem={"v2"}
      minHeaderWidth={"100%"}
      maxHeaderWidth={"100%"}
      minBodyWidth={"100%"}
      variant={"light-violet"}
      position={"absolute"}
      zIndex={200}
    />
  </div>

  <div class="flex-shrink-0">
    <Button
      title={isCodeCopied ? "Copied" : "Copy Code"}
      size={"small"}
      type={"teritiary-regular"}
      startIcon={isCodeCopied ? TickIcon : CopyRegular}
      iconSize={14}
      onClick={handleCopyCode}
    />
  </div>
</div>

<div
  class="request-body position-relative w-100"
  style="background-color: var(--bg-ds-neutral-900); border-radius: 2px; height: 260px; border: 1px solid var(--border-color, rgba(255,255,255,0.1));"
>
  <Editor
    bind:lang={codeTemplateLanguage}
    bind:value={codeTemplate}
    on:change={() => {}}
    isEditable={false}
    autofocus={false}
    isBodyBeautified={isCodeTemplateBeautified}
    beautifySyntaxCallback={updateCodeTemplateBeautifiedState}
  />
</div>

<style>
</style>
