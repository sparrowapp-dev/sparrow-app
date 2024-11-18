<script>
  import { Button } from "@sparrow/library/ui";
  export let handleLogin;
  export let isPopupOpen;
</script>

<!-- Section for the modal content -->
<section>
  <div>
    <p class="lightGray" style="color: lightGray;">
      After continuing your data will be lost, do you want to continue?
    </p>
  </div>

  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end">
    <span style="margin-right: 15px;">
      <Button
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
          isPopupOpen = false;
        }}
      />
    </span>
    <Button
      disable={false}
      title={"Confirm"}
      textClassProp={"fs-6"}
      type={"primary"}
      onClick={() => {
        handleLogin();
      }}
    />
  </div>
</section>
