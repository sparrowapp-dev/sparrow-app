<script lang="ts">
  import Crossicon from "$lib/assets/crossicon.svelte";
</script>

<div
  class="container d-flex flex-column"
  style="  background-color:#1C1D2B; border-radius:4px; "
>
  <button
    class="b-0 border-0"
    style="position:absolute; right:20px; top:120px; background-color:transparent "
  >
    <Crossicon />
  </button>
  <div class="heading">Welcome to Environments!</div>
  <p class="description">
    Environments allow you to manage different sets of confirguration variables
    for various stages of your application (e.g., Development, Staging,
    Production). This helps in organizing and isolating settings, making testing
    and deployment easier and more efficient. <span class="link"
      >See how it works.</span
    >
  </p>
</div>

<style>
  .container {
    margin-bottom: 10px;
  }
  .heading {
    padding-top: 10px;
    padding-left: 10px;
    font-weight: 700;
  }
  .description {
    padding-top: 5px;
    padding-left: 10px;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
  }
  .link {
    color: #3670f7;
    text-decoration: underline;
  }
</style>
