<script>
  import angleDown from "$lib/assets/angle-down.svg";
  import linkIcon from "$lib/assets/linkIcon.svg";
</script>

<div class="mt-4 pb-0 ps-1 pe-1 w-100">
  <div
    class="d-flex align-items-center gap-4"
    style="font-size: 12px;font-weight:500;border-bottom:1px solid var(--border-color)"
  >
    <div>
      <p class="text-requestBodyColor ps-1">Auth Type</p>
    </div>
    <div class="ps-5">
      <button class="d-flex bg-backgroundColor border-0">
        <p>No Auth</p>
        <img src={angleDown} alt="" />
      </button>
    </div>
  </div>
  <div
    class="d-flex align-items-center justify-content-center mt-4 text-requestBodyColor"
    style="font-size: 14px;font-weight:500;"
  >
    <p>
      This request does not use any authorization. Please specify the
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

  <div style="font-size: 12px;">
    <a href="#" class="text-labelColor"
      >Learn more about Authorization <img
        src={linkIcon}
        alt="link icon"
        class=" ps-1"
      /></a
    >
  </div>
</div>

<style>
  button:hover {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }

  /* Add a border bottom when the button is pressed (active) */
  button:active {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }
</style>
