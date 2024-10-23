<script lang="ts">
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";

  export let isOpen = false;
  export let isSaveDisabled = false;
  export let onModalStateChanged: (flag: boolean) => void;
  export let onCancel: (data: boolean) => void;
  export let onSave: () => void;
  export let onDiscard: () => void;
  export let loader: boolean = false;
  export let isGuestUser = false;
</script>

<Modal
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
  <div class="row">
    <div class="col-12 mb-2 col-xl-5 col-xxl-3">
      <Button
        buttonStyleProp={"width:100%;"}
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
          onCancel(false);
        }}
      />
    </div>
    <div class="col-12 mb-2 col-xl-7 col-xxl-4">
      <Button
        buttonStyleProp={"width:100%;"}
        title={"Discard Changes"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
          onDiscard();
        }}
      />
    </div>
    <div class="col-12 col-xl-12 col-xxl-5">
      <Button
        buttonStyleProp={"width:100%;"}
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
</Modal>
