<script>
  import { Button } from "@sparrow/library/ui";
  export let isResponseStateModalOpen = false;
  export let onHandleMockResponseState;
  export let responseToToggle = null;
</script>

<div
  class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium"
>
  <p>
    ‘{responseToToggle?.name}’ response has a ratio set. Disabling it will
    remove it from the assigned responses. Do you want to proceed?
  </p>
</div>

<div
  class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
>
  <Button
    title={"Cancel"}
    textStyleProp={"font-size: var(--base-text)"}
    type={"secondary"}
    loader={false}
    onClick={() => {
      isResponseStateModalOpen = false;
      responseToToggle = null;
    }}
  />

  <Button
    title={"Yes, Continue"}
    textStyleProp={"font-size: 14px"}
    type={"primary"}
    loader={false}
    onClick={() => {
      onHandleMockResponseState(
        responseToToggle.id,
        !responseToToggle.mockRequestResponse.isMockResponseActive,
      );
      isResponseStateModalOpen = false;
    }}
  />
</div>
