<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script lang="ts">
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

  let username: string;
  let password: string;
  const unsubscribeBasicAuth_username = basicAuth_username.subscribe(
    (value) => {
      if (value) {
        username = value;
      }
    },
  );
  const unsubscribeBasicAuth_password = basicAuth_password.subscribe(
    (value) => {
      if (value) {
        password = value;
      }
    },
  );

  if (username && password) {
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    const header = `Basic ${encodedCredentials}`;
    basicAuthHeader.set(header);
  }

  let basicAuthHeaderValue: string;

  const unsubscribeBasicAuthHeader = basicAuthHeader.subscribe((value) => {
    if (value) {
      basicAuthHeaderValue = value;
    }
  });

  let BearerTokenValue: string;
  const unsubscribeBearerToken = BearerToken.subscribe((value) => {
    if (value) {
      BearerTokenValue = value;
    }
  });

  let apiKeyText: string;
  let apiValueText: string;
  const unsubscribeApiKey = apiKey.subscribe((value) => {
    if(value){
      apiKeyText=value
    }
  });
  const unsubscribeApiValue = apiValue.subscribe((value) => {
    if (value) {
      apiValueText = value;
    }
  });

  unsubscribeBasicAuth_password();
  unsubscribeBasicAuth_username();
  unsubscribeBasicAuthHeader();
  unsubscribeBearerToken();
  unsubscribeApiKey();
  unsubscribeApiValue();
</script>

<div class="d-flex pe-2 flex-column bg-backgroundColor">
  {#if username.length > 0 && password.length > 0}
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
          placeholder="Authorization"
          style="outline: none;font-size:13px;color:white;"
          class="form-control bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
          disabled
        />
      </div>
      <input
        type="text"
        placeholder={basicAuthHeaderValue}
        style="outline: none;font-size:13px;color:white"
        class="form-control bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        disabled
      />
      <img src={trashIcon} alt="" />
    </div>
  {/if}

  {#if BearerTokenValue.length > 0}
    <div
      class="d-flex align-items-center justify-content-center ps-1 gap-3 mb-2"
    >
      <img src={dragIcon} alt="" style="cursor:grabbing;" />
      <div>
        <input class="form-check-input" type="checkbox" checked disabled />
      </div>
      <div>
        <input
          type="text"
          placeholder="Authorization"
          style="outline: none;font-size:13px;color:white;"
          class="form-control bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
          readonly
        />
      </div>
      <input
        type="text"
        placeholder={"Bearer" + " " + BearerTokenValue}
        style="outline: none;font-size:13px;color:white"
        class="form-control bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
      <img src={trashIcon} alt="" />
    </div>
  {/if}

  {#if apiKeyText.length > 0 && apiValueText.length > 0}
    <div
      class="d-flex align-items-center justify-content-center ps-1 gap-3 mb-2"
    >
      <img src={dragIcon} alt="" style="cursor:grabbing;" />
      <div>
        <input class="form-check-input" type="checkbox" checked disabled />
      </div>
      <div>
        <input
          type="text"
          placeholder={apiKeyText}
          style="outline: none;font-size:13px;color:white;"
          class="form-control bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
          readonly
        />
      </div>
      <input
        type="text"
        placeholder={apiKeyText}
        style="outline: none;font-size:13px;color:white"
        class="form-control bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
      <img src={trashIcon} alt="" />
    </div>
  {/if}

  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
    <img src={dragIcon} alt="" style="cursor:grabbing;" />
    <div>
      <input class="form-check-input" type="checkbox" checked />
    </div>
    <div class="flex-grow-1 w-100">
      <input
        type="text"
        placeholder="Content-Type"
        style="outline: none;font-size:13px;color:white;"
        class="form-control bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <div class="flex-grow-1 w-100">
      <input
        type="text"
        placeholder="application/json"
        style="outline: none;font-size:13px;color:white"
        class="form-control bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <img src={trashIcon} alt="" />
  </div>
  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
    <img src={dragIcon} alt="" style="cursor:grabbing;" />
    <div>
      <input class="form-check-input" type="checkbox" checked />
    </div>
    <div class="flex-grow-1 w-100">
      <input
        type="text"
        placeholder="User-Agent"
        style="outline: none;font-size:13px;color:white;"
        class="form-control bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <div class="flex-grow-1 w-100">
      <input
        type="text"
        placeholder="PostmanRuntime/7.33.0"
        style="outline: none;font-size:13px;color:white"
        class="form-control bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <img src={trashIcon} alt="" />
  </div>
  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
    <img src={dragIcon} alt="" style="cursor:grabbing;" />
    <div>
      <input class="form-check-input" type="checkbox" checked />
    </div>
    <div class="flex-grow-1 w-100">
      <input
        type="text"
        placeholder="Accept"
        style="outline: none;font-size:13px;color:white;"
        class="form-control bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <div class="flex-grow-1 w-100">
      <input
        type="text"
        placeholder="*/*"
        style="outline: none;font-size:13px;color:white"
        class="form-control bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <img src={trashIcon} alt="" />
  </div>
  <div class="d-flex align-items-center justify-content-center gap-2 ps-1 mb-2">
    <img src={dragIcon} alt="" style="cursor:grabbing;" />
    <div>
      <input class="form-check-input" type="checkbox" checked />
    </div>
    <div class="flex-grow-1 w-100">
      <input
        type="text"
        placeholder="Connection"
        style="outline: none;font-size:13px;color:white;"
        class="form-control bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <div class="flex-grow-1 w-100">
      <input
        type="text"
        placeholder="keep-alive"
        style="outline: none;font-size:13px;color:white"
        class="form-control bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <img src={trashIcon} alt="" />
  </div>
</div>

<style>
  input::placeholder {
    color: var(--white-color);
  }
</style>
