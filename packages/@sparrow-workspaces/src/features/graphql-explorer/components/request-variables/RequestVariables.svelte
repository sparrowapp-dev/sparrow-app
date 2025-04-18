<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" | "Graphql" =
    "JSON";
  export let value = "";
  export let onUpdateRequestVariable: (data: string) => void = () => {};
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestVariable(e.detail);
  };
  let isBodyBeautified = false;
  export let onClearQuery;
</script>

<div class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative">
  <div style="flex:1; overflow:auto;">
    <div class="d-flex flex-column h-100">
      <div style="flex:1; overflow:auto; position:relative;">
        <div class="h-100">
          <Editor
            bind:lang
            bind:value
            on:change={handleCodeMirrorChange}
            isEditable={true}
            autofocus={true}
            class="m-0"
            {isBodyBeautified}
            placeholder={""}
          />
        </div>
      </div>
    </div>
  </div>
  <div class="d-flex justify-content-end">
    <Button
      size="small"
      type="teritiary-regular"
      title="Clear Query"
      onClick={onClearQuery}
    />
  </div>
</div>
