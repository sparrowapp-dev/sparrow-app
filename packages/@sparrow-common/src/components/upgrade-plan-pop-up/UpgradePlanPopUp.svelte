<script>
  import { Button } from "@sparrow/library/ui";
  export let isUpgradePlanModelOpen;
</script>

<div class="text-fs-14 pt-3">
  <div>
    <p style=" color: var(--text-ds-neutral-100); " class="text-fs-14">
      You're j ust one step away! To complete your upgrade and unlock full
      access to all features, you will be redirected to the Admin Panel where
      you can securely make your payment and activate your plan.
    </p>
  </div>
  <div class="d-flex justify-content-end gap-3 pt-2">
    <Button
      title={"Cancel"}
      textStyleProp={"font-size:14px; font-weight:500;"}
      type={"secondary"}
      onClick={() => {
        isUpgradePlanModelOpen = false;
      }}
    />
    <Button
      title={"Go to Admin Panel"}
      textStyleProp={"font-size:14px; font-weight:500;"}
      type={"primary"}
    />
  </div>
</div>
