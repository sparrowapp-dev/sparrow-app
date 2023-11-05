<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script lang="ts">
  import {
    BearerToken,
    apiKey,
    apiValue,
    basicAuthHeader,
    basicAuth_password,
    basicAuth_username,
  } from "$lib/store/authorization";
  export let responseHeader;

  let username: string;
  let password: string;
  const unsubscribeBasicAuth_username = basicAuth_username.subscribe(
    (value) => (username = value),
  );
  const unsubscribeBasicAuth_password = basicAuth_password.subscribe(
    (value) => (password = value),
  );

  if (username && password) {
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    const header = `Basic ${encodedCredentials}`;
    basicAuthHeader.set(header);
  }

  let basicAuthHeaderValue: string;

  const unsubscribeBasicAuthHeader = basicAuthHeader.subscribe((value) => {
    basicAuthHeaderValue = value;
  });

  let BearerTokenValue: string;
  const unsubscribeBearerToken = BearerToken.subscribe(
    (value) => (BearerTokenValue = value),
  );

  let apiKeyText: string;
  let apiValueText: string;
  const unsubscribeApiKey = apiKey.subscribe((value) => (apiKeyText = value));
  const unsubscribeApiValue = apiValue.subscribe(
    (value) => (apiValueText = value),
  );
  unsubscribeBasicAuth_password();
  unsubscribeBasicAuth_username();
  unsubscribeBasicAuthHeader();
  unsubscribeBearerToken();
  unsubscribeApiKey();
  unsubscribeApiValue();
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

  {#each responseHeader as [key, value]}
  <div class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2">
    <div>
      <input
        type="text"
        placeholder={key}
        style="outline: none;font-size:13px;color:white;"
        class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
    <input
      type="text"
      placeholder={value}
      style="outline: none;font-size:13px;color:white"
      class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
      readonly
    />
  </div>
{/each}

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
    color: var(--white-color);
  }
</style>
