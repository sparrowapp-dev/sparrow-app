<script lang="ts">
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";

  export let isOpen = false;
  export let onModalStateChanged: (flag: boolean) => void;
  export let onCancel: () => void;
  export let onContinue: () => void;
  export let title = "";
  export let description = "";
</script>

<Modal
  {title}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  {isOpen}
  handleModalState={onModalStateChanged}
>
  <div class="pt-2 pb-4">
    <small class="">
      {description}
    </small>
  </div>
  <div class="d-flex justify-content-between">
    <div style="margin-right: 15px;">
      <Button
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
          onCancel();
        }}
      />
    </div>
    <div class="d-flex">
      <span style="margin-right: 15px;">
        <Button
          title={"Continue"}
          textClassProp={"fs-6"}
          type={"primary"}
          onClick={() => {
            onContinue();
          }}
        />
      </span>
    </div>
  </div>
</Modal>
