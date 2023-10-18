<script>
  import linkIcon from "$lib/assets/linkIcon.svg";
</script>

<div class="ps-1 pe-1 w-100">
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
