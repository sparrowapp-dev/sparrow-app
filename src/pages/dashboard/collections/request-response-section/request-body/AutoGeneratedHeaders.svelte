<script>
  let retrievedValue1 = localStorage.getItem("inputValue1");
  let retrievedValue2 = localStorage.getItem("inputValue2");
  let BearerTokenValue = localStorage.getItem("BearerTokenValue");
</script>

<div
  class="w-100"
  style="
            width: 460px;
            margin-right: 1px;
            padding-top: 3px;
            
            background-color:backgroundColor; /* Modify as needed */
            
            display: flex;
            flex-direction: column;
          "
>
  {#if BearerTokenValue.length > 0}
    <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
      <div>
        <input class="form-check-input" type="checkbox" checked disabled />
      </div>
      <div>
        <input
          type="text"
          placeholder="Authorization"
          style="outline: none;font-size:13px;color:white;"
          class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
          disabled
        />
      </div>
      <input
        type="text"
        placeholder={BearerTokenValue}
        style="outline: none;font-size:13px;color:white"
        class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        disabled
      />
    </div>
  {/if}

  {#if retrievedValue1.length > 0 && retrievedValue1.length > 0}
    <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
      <div>
        <input class="form-check-input" type="checkbox" checked disabled />
      </div>
      <div>
        <input
          type="text"
          placeholder={retrievedValue1}
          style="outline: none;font-size:13px;color:white;"
          class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
          disabled
        />
      </div>
      <input
        type="text"
        placeholder={retrievedValue2}
        style="outline: none;font-size:13px;color:white"
        class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        disabled
      />
    </div>
  {/if}

  <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
    <div>
      <input class="form-check-input" type="checkbox" checked />
    </div>
    <div>
      <input
        type="text"
        placeholder="Content-Type"
        style="outline: none;font-size:13px;color:white;"
        class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        disabled
      />
    </div>
    <input
      type="text"
      placeholder="application/json"
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      disabled
    />
  </div>
  <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
    <div>
      <input class="form-check-input" type="checkbox" checked />
    </div>
    <div>
      <input
        type="text"
        placeholder="User-Agent"
        style="outline: none;font-size:13px;color:white;"
        class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        disabled
      />
    </div>
    <input
      type="text"
      placeholder="PostmanRuntime/7.33.0"
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      disabled
    />
  </div>
  <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
    <div>
      <input class="form-check-input" type="checkbox" checked />
    </div>
    <div>
      <input
        type="text"
        placeholder="Accept"
        style="outline: none;font-size:13px;color:white;"
        class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        disabled
      />
    </div>
    <input
      type="text"
      placeholder="*/*"
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      disabled
    />
  </div>
  <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
    <div>
      <input class="form-check-input" type="checkbox" checked />
    </div>
    <div>
      <input
        type="text"
        placeholder="Connection"
        style="outline: none;font-size:13px;color:white;"
        class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        disabled
      />
    </div>
    <input
      type="text"
      placeholder="keep-alive"
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      disabled
    />
  </div>
</div>

<style>
  input::placeholder {
    color: var(--white-color); /* Replace 'blue' with your desired color */
  }
</style>
