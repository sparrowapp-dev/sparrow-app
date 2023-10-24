<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script>
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";

  import {
    basicAuthHeader,
    basicAuth1,
    basicAuth2,
    BearerToken,
    apiKey1,
    apiKey2,
  } from "$lib/store/requestSection";

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
  class="d-flex flex-column pe-5 ps-2 align-items-center bg-backgroundColor"
  style="width:460px;"
>
  {#if username.length > 0 && password.length > 0}
    <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
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
    <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
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
    <div
      class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2"
    >
      <img src={dragIcon} alt="" style="cursor:grabbing;" />
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
      <img src={trashIcon} alt="" />
    </div>
  {/if}

  <div class="d-flex align-items-center justify-content-center gap-2 mb-2 ps-1">
    <img src={dragIcon} alt="" style="cursor:grabbing;" />
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
    <img src={trashIcon} alt="" />
  </div>
  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
    <img src={dragIcon} alt="" style="cursor:grabbing;" />
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
    <img src={trashIcon} alt="" />
  </div>
  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
    <img src={dragIcon} alt="" style="cursor:grabbing;" />
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
    <img src={trashIcon} alt="" />
  </div>
  <div class="d-flex align-items-center justify-content-center gap-2 ps-1 mb-2">
    <img src={dragIcon} alt="" style="cursor:grabbing;" />
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
    <img src={trashIcon} alt="" />
  </div>
</div>

<style>
  input::placeholder {
    color: var(--white-color); /* Replace 'blue' with your desired color */
  }
</style>
