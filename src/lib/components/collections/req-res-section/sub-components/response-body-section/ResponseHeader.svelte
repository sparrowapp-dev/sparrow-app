<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script>
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import {
    BearerToken,
    apiKey,
    apiValue,
    basicAuthHeader,
    basicAuth_password,
    basicAuth_username,
  } from "$lib/store/authorization";

  // storing the value from store for Basic auth section
  let username;
  let password;
  basicAuth_username.subscribe((value) => (username = value));
  basicAuth_password.subscribe((value) => (password = value));

  if (username && password) {
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    const header = `Basic ${encodedCredentials}`;
    basicAuthHeader.set(header);
  }

  let basicAuthHeaderValue;

  basicAuthHeader.subscribe((value) => {
    basicAuthHeaderValue = value;
  });

  // storing the value from store for Bearer token section
  let BearerTokenValue;
  BearerToken.subscribe((value) => (BearerTokenValue = value));

  // storing the value from store for apiKey section
  let apiKeyText;
  let apiValueText;
  apiKey.subscribe((value) => (apiKeyText = value));
  apiValue.subscribe((value) => (apiValueText = value));
</script>

<div
  class="d-flex flex-column align-items-center bg-backgroundColor mt-4 w-100"
>
  {#if username.length > 0 && password.length > 0}
    <div
      class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2 w-100"
    >
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
        placeholder={basicAuthHeaderValue}
        style="outline: none;font-size:13px;color:white"
        class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        disabled
      />
    </div>
  {/if}

  {#if BearerTokenValue.length > 0}
    <div
      class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2"
    >
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

  {#if apiKeyText.length > 0 && apiValueText.length > 0}
    <div
      class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2"
    >
      <div>
        <input
          type="text"
          placeholder={apiKeyText}
          style="outline: none;font-size:13px;color:white;"
          class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
          readonly
        />
      </div>
      <input
        type="text"
        placeholder={apiKeyText}
        style="outline: none;font-size:13px;color:white"
        class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
  {/if}

  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
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
  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
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
  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
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
  <div class="d-flex align-items-center justify-content-center gap-2 ps-1 mb-2">
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
