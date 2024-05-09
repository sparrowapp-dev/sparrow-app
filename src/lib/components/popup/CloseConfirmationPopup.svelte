<script lang="ts">
  import { ModalWrapperV1 } from "..";
  import Button from "../buttons/Button.svelte";

  export let isOpen = false;
  export let isSaveDisabled = false;
  export let onModalStateChanged: (flag: boolean) => void;
  export let onCancel: (data: boolean) => void;
  export let onSave: () => void;
  export let onDiscard: () => void;
  export let loader: boolean = false;
</script>

<ModalWrapperV1
  title={"Save Changes?"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  {isOpen}
  handleModalState={onModalStateChanged}
>
  <div class="pt-2 pb-4">
    <small class="">
      You have unsaved changes. Do you want to save them before closing the
      file?
    </small>
  </div>
  <div class="d-flex justify-content-between">
    <div style="margin-right: 15px;">
      <Button
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
          onCancel(false);
        }}
      />
    </div>
    <div class="d-flex">
      <span style="margin-right: 15px;">
        <Button
          title={"Discard Changes"}
          textClassProp={"fs-6"}
          type={"dark"}
          onClick={() => {
            onDiscard();
          }}
        />
      </span>
      <Button
        disable={isSaveDisabled}
        title={"Save Changes"}
        textClassProp={"fs-6"}
        type={"primary"}
        loaderSize={18}
        {loader}
        onClick={() => {
          onSave();
        }}
      />
    </div>
  </div>
</ModalWrapperV1>
