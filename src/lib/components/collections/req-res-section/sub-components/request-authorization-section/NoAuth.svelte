<script lang="ts">
  import linkIcon from "$lib/assets/linkIcon.svg";

  function handleLinkClick(event) {
    event.preventDefault();
  }
</script>

<div class="ps-1 pe-1 w-100">
  <div
    class="d-flex align-items-center justify-content-center mt-4 text-requestBodyColor"
    style="font-size: 14px;font-weight:500;"
  >
    <p class="text-center">
      This request does not use any authorization.<br />Please specify the
      authorization type, if needed.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-center mt-4 text-requestBodyColor"
    style="font-size: 12px;font-weight:500;"
  >
    <p>
      Authorization, in the context of REST APIs, is all about your access. It
      verifies your identity and permissions, ensuring you can only access what
      you're allowed to do. For some APIs, authorization is necessary to receive
      a valid response.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-center mt-0 text-requestBodyColor"
    style="font-size: 12px;font-weight:500;"
  >
    <p>
      Many modern web applications and APIs use token-based authentication and
      authorization. Tokens you specify are automatically included in HTTP
      headers of the request. Remember to keep your tokens secure.
    </p>
  </div>
  <div class="d-flex align-items-center gap-2">
    <a class="learn-auth-link sparrow-fs-12" href="" on:click={handleLinkClick}
      >Learn more about Authorization</a
    > <img src={linkIcon} alt="" />
  </div>
</div>

<style>
  .learn-auth-link {
    color: var(--sparrow-blue);
  }

  img {
    width: 20px;
  }
</style>
