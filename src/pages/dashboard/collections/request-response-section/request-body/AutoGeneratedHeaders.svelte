<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script>
  import {
    basicAuthHeader,
    basicAuth1,
    basicAuth2,
    BearerToken,
    apiKey1,
    apiKey2,
  } from "$lib/store/requestSection";

  let retrievedValue1 = localStorage.getItem("inputValue1");
  let retrievedValue2 = localStorage.getItem("inputValue2");

  // storing the value from store for Basic auth section
  let username;
  let password;
  basicAuth1.subscribe((value) => (username = value));
  basicAuth2.subscribe((value) => (password = value));

  // storing the value from store for Bearer token section
  let BearerTokenValue;
  BearerToken.subscribe((value) => (BearerTokenValue = value));

  // storing the value from store for apiKey section
  let apiKey;
  let apiValue;
  apiKey1.subscribe((value) => (apiKey = value));
  apiKey2.subscribe((value) => (apiValue = value));
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
  {#if username.length > 0 && password.length > 0}
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
        placeholder={$basicAuthHeader}
        style="outline: none;font-size:13px;color:white"
        class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        disabled
      />
    </div>
  {/if}

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
          readonly
        />
      </div>
      <input
        type="text"
        placeholder={"Bearer" + " " + BearerTokenValue}
        style="outline: none;font-size:13px;color:white"
        class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
  {/if}

  {#if apiKey.length > 0 && apiValue.length > 0}
    <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
      <div>
        <input class="form-check-input" type="checkbox" checked disabled />
      </div>
      <div>
        <input
          type="text"
          placeholder={apiKey}
          style="outline: none;font-size:13px;color:white;"
          class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
          readonly
        />
      </div>
      <input
        type="text"
        placeholder={apiValue}
        style="outline: none;font-size:13px;color:white"
        class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
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
        readonly
      />
    </div>
    <input
      type="text"
      placeholder="application/json"
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      readonly
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
        readonly
      />
    </div>
    <input
      type="text"
      placeholder="PostmanRuntime/7.33.0"
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      readonly
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
        readonly
      />
    </div>
    <input
      type="text"
      placeholder="*/*"
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      readonly
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
        readonly
      />
    </div>
    <input
      type="text"
      placeholder="keep-alive"
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      readonly
    />
  </div>
</div>

<style>
  input::placeholder {
    color: var(--white-color); /* Replace 'blue' with your desired color */
  }
</style>
