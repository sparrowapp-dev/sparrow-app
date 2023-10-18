<script>
  let BasicAuth1 = localStorage.getItem("BasicAuth1") || "";
  let BasicAuth2 = localStorage.getItem("BasicAuth2") || "";

  const handleInput1 = (event) => {
    BasicAuth1 = event.target.value;
    localStorage.setItem("BasicAuth1", BasicAuth1);
  };

  const handleInput2 = (event) => {
    BasicAuth2 = event.target.value;
    localStorage.setItem("BasicAuth2", BasicAuth2);
  };
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-4"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Username</p>

    <input
      type="text"
      style="outline: none;"
      class="w-75 bg-backgroundColor border-0 h-75 ps-2"
      placeholder="Enter Username"
      bind:value={BasicAuth1}
      on:input={handleInput1}
    />
  </div>

  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Password</p>

    <input
      type="text"
      style="outline: none;"
      class="w-75 bg-backgroundColor border-0 h-75 ps-2"
      placeholder="Enter Password"
      bind:value={BasicAuth2}
      on:input={handleInput2}
    />
  </div>
</div>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
