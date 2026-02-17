<script lang="ts">
  import { CodeMirrorInput } from "@sparrow/workspaces/components";
  import { AuthInputTheme } from "@sparrow/workspaces/utils";
  import { RadioButton, Button, notifications } from "@sparrow/library/ui";
  import { HttpRequestOAuth2GrantTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import { OAuth2TokenService } from "../../../../services/oauth2-token.service";

  export let oauth2Data: any;
  export let callback;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let disabled = false;

  const theme = new AuthInputTheme().build();
  const tokenService = new OAuth2TokenService();

  let isGettingToken = false;
  let tokenStatus = "";

  const getDefaultCallbackUrl = () => {
    return "http://localhost/callback";
  };

  // Initialize with default values if not set
  // Ensure grantType always has a value for radio button binding
  $: {
    if (!oauth2Data) {
      oauth2Data = {
        grantType: HttpRequestOAuth2GrantTypeBaseEnum.CLIENT_CREDENTIALS,
        headerPrefix: "Bearer",
        callbackUrl: getDefaultCallbackUrl(),
        clientId: "",
        clientSecret: "",
        authUrl: "",
        accessTokenUrl: "",
        scope: "",
        state: "",
        accessToken: "",
      };
    } else {
      // Ensure required fields have defaults
      if (!oauth2Data.grantType) {
        oauth2Data.grantType =
          HttpRequestOAuth2GrantTypeBaseEnum.CLIENT_CREDENTIALS;
      }
      if (!oauth2Data.headerPrefix) {
        oauth2Data.headerPrefix = "Bearer";
      }
      if (!oauth2Data.callbackUrl) {
        oauth2Data.callbackUrl = getDefaultCallbackUrl();
      }
    }
  }

  const handleAuthChange = () => {
    callback({ oauth2: oauth2Data });
  };

  const handleGrantTypeChange = (event: any) => {
    oauth2Data.grantType = event.target.value;
    handleAuthChange();
  };

  const handleGetToken = async () => {
    isGettingToken = true;
    tokenStatus = "Obtaining token...";

    try {
      let tokenResponse;

      if (
        oauth2Data.grantType ===
        HttpRequestOAuth2GrantTypeBaseEnum.CLIENT_CREDENTIALS
      ) {
        tokenResponse = await tokenService.getTokenClientCredentials({
          clientId: oauth2Data.clientId,
          clientSecret: oauth2Data.clientSecret,
          accessTokenUrl: oauth2Data.accessTokenUrl,
          scope: oauth2Data.scope,
        });
      } else if (
        oauth2Data.grantType ===
        HttpRequestOAuth2GrantTypeBaseEnum.AUTHORIZATION_CODE
      ) {
        tokenResponse = await tokenService.getTokenAuthorizationCode({
          clientId: oauth2Data.clientId,
          clientSecret: oauth2Data.clientSecret,
          authUrl: oauth2Data.authUrl,
          accessTokenUrl: oauth2Data.accessTokenUrl,
          callbackUrl: oauth2Data.callbackUrl,
          scope: oauth2Data.scope,
          state: oauth2Data.state,
        });
      }

      if (tokenResponse?.access_token) {
        oauth2Data.accessToken = tokenResponse.access_token;
        tokenStatus = "Token obtained successfully";
        notifications.success("Access token obtained successfully");
        handleAuthChange();
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Error obtaining token:", error);
      tokenStatus = "Failed to obtain token";
      const err = error as Error;
      notifications.error("Failed to obtain access token: " + err.message);
    } finally {
      isGettingToken = false;
    }
  };
</script>

<div class="d-flex flex-column w-100">
  <p class="text-fs-12 fw-bold mb-2">Grant Type</p>
  <div class="d-flex ps-1 gap-3 mb-3">
    <div class="radio text-fs-12 d-flex align-items-center">
      <RadioButton
        id="oauth2-grant-cc"
        name="oauth2-grant"
        value={HttpRequestOAuth2GrantTypeBaseEnum.CLIENT_CREDENTIALS}
        group={oauth2Data.grantType}
        handleChange={handleGrantTypeChange}
        labelText="Client Credentials"
        buttonSize="medium"
        {disabled}
      />
    </div>
    <div class="radio text-fs-12 d-flex align-items-center">
      <RadioButton
        id="oauth2-grant-ac"
        name="oauth2-grant"
        value={HttpRequestOAuth2GrantTypeBaseEnum.AUTHORIZATION_CODE}
        group={oauth2Data.grantType}
        handleChange={handleGrantTypeChange}
        labelText="Authorization Code"
        buttonSize="medium"
        {disabled}
      />
    </div>
  </div>

  <!-- Header Prefix -->
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Header Prefix</p>
    <div class="position-relative" style="min-height: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={oauth2Data.headerPrefix}
          onUpdateInput={handleAuthChange}
          placeholder="Bearer"
          {theme}
          {disabled}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>

  <!-- Client ID -->
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Client ID</p>
    <div class="position-relative" style="min-height: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={oauth2Data.clientId}
          onUpdateInput={handleAuthChange}
          placeholder="Enter client ID"
          {theme}
          {disabled}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>

  <!-- Client Secret -->
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Client Secret</p>
    <div class="position-relative" style="min-height: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={oauth2Data.clientSecret}
          onUpdateInput={handleAuthChange}
          placeholder="Enter client secret"
          {theme}
          {disabled}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>

  {#if oauth2Data.grantType === HttpRequestOAuth2GrantTypeBaseEnum.AUTHORIZATION_CODE}
    <!-- Callback URL (only for Authorization Code) -->
    <div class="mb-3" style="font-size: 12px; font-weight:500">
      <p class="mb-2 text-secondary-100">Callback URL</p>
      <div class="position-relative" style="min-height: 40px;">
        <div class="position-absolute top-0 auth-input-container">
          <CodeMirrorInput
            bind:value={oauth2Data.callbackUrl}
            onUpdateInput={handleAuthChange}
            placeholder={"http://localhost/callback"}
            {theme}
            {disabled}
            {environmentVariables}
            {onUpdateEnvironment}
          />
        </div>
      </div>
      <p class="mt-2 text-fs-10 text-secondary-200" style="font-style: italic;">
        Enter the redirect URI configured in your OAuth provider.
      </p>
    </div>

    <!-- Auth URL (only for Authorization Code) -->
    <div class="mb-3" style="font-size: 12px; font-weight:500">
      <p class="mb-2 text-secondary-100">Authorization URL</p>
      <div class="position-relative" style="min-height: 40px;">
        <div class="position-absolute top-0 auth-input-container">
          <CodeMirrorInput
            bind:value={oauth2Data.authUrl}
            onUpdateInput={handleAuthChange}
            placeholder="https://authorization-server.com/oauth/authorize"
            {theme}
            {disabled}
            {environmentVariables}
            {onUpdateEnvironment}
          />
        </div>
      </div>
    </div>
  {/if}

  <!-- Access Token URL -->
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Access Token URL</p>
    <div class="position-relative" style="min-height: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={oauth2Data.accessTokenUrl}
          onUpdateInput={handleAuthChange}
          placeholder="https://authorization-server.com/oauth/token"
          {theme}
          {disabled}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>

  <!-- Scope -->
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Scope (optional)</p>
    <div class="position-relative" style="min-height: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={oauth2Data.scope}
          onUpdateInput={handleAuthChange}
          placeholder="read write"
          {theme}
          {disabled}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>

  {#if oauth2Data.grantType === HttpRequestOAuth2GrantTypeBaseEnum.AUTHORIZATION_CODE}
    <!-- State (only for Authorization Code) -->
    <div class="mb-3" style="font-size: 12px; font-weight:500">
      <p class="mb-2 text-secondary-100">State (optional)</p>
      <div class="position-relative" style="min-height: 40px;">
        <div class="position-absolute top-0 auth-input-container">
          <CodeMirrorInput
            bind:value={oauth2Data.state}
            onUpdateInput={handleAuthChange}
            placeholder="random-state-value"
            {theme}
            {disabled}
            {environmentVariables}
            {onUpdateEnvironment}
          />
        </div>
      </div>
    </div>
  {/if}

  <!-- Get Token Button -->
  {#if !disabled}
    <div class="mb-3">
      <Button
        type="primary"
        title={isGettingToken ? "Getting Token..." : "Get Access Token"}
        onClick={handleGetToken}
        disable={isGettingToken ||
          !oauth2Data.clientId ||
          !oauth2Data.clientSecret ||
          !oauth2Data.accessTokenUrl ||
          (oauth2Data.grantType ===
            HttpRequestOAuth2GrantTypeBaseEnum.AUTHORIZATION_CODE &&
            (!oauth2Data.authUrl || !oauth2Data.callbackUrl))}
        loader={isGettingToken}
        startIcon={undefined}
        endIcon={undefined}
      />
    </div>
    {#if tokenStatus}
      <p
        class="mt-2 text-fs-12"
        style="color: {tokenStatus.includes('success')
          ? 'var(--text-ds-success-500)'
          : tokenStatus.includes('Failed')
            ? 'var(--text-ds-error-500)'
            : 'var(--text-ds-neutral-400)'}"
      >
        {tokenStatus}
      </p>
    {/if}
  {/if}

  <!-- Access Token -->
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Access Token</p>
    <div class="position-relative" style="min-height: 40px;">
      <div class="position-absolute top-0 auth-input-container">
        <CodeMirrorInput
          bind:value={oauth2Data.accessToken}
          onUpdateInput={handleAuthChange}
          placeholder="Token will appear here after clicking 'Get Access Token' or enter manually"
          {theme}
          {disabled}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    max-width: 615px;
    width: 100%;
  }

  .radio {
    outline: none;
    position: relative;
  }
</style>
