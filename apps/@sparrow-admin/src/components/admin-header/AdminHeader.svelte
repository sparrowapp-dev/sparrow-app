<script>
  import SparrowAdminLogo from "../../icons/Sparrow-admin-logo.svelte";
  export let title = "Sparrow Admin";
</script>

<div class="container">
  <div class="d-flex" style="align-items:center">
    <SparrowAdminLogo height={"30px"} width={"24px"} />
    <p
      style="font-size: 16px; padding-top:5px; padding-left:5px; color:#FFFFFF"
    >
      {title}
    </p>
  </div>
</div>

<style>
  .container {
    background: linear-gradient(90deg, #0f121a 0%, #14334d 5%, #0f121a 20%);
    border-radius: 4px;
    max-width: 99vw;
    min-height: 32px;
    align-items: center;
    flex: 1;
  }
</style>
