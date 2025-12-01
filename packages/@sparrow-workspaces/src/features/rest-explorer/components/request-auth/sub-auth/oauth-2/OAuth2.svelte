<script lang="ts">
  import type {
    OAuth2,
    OAuth2Configuration,
  } from "@sparrow/common/types/workspace";
  export let oAuthData: OAuth2;
  export let callback: any;
  export let environmentVariables;

  let configuration: OAuth2Configuration = { ...oAuthData.configuration };
  let newScope: string = "";
  let isGeneratingToken: boolean = false;
  let tokenError: string = "";

  // Available grant types
  const grantTypes = [
    { value: "authorization_code", label: "Authorization Code" },
    { value: "client_credentials", label: "Client Credentials" },
    { value: "password", label: "Password" },
    { value: "implicit", label: "Implicit" },
  ];

  const addToOptions = [
    { value: "Header", label: "Header" },
    { value: "Body", label: "Body" },
    { value: "Query", label: "Query Parameters" },
  ];

  // Add scope to the list
  const addScope = () => {
    if (newScope.trim() && !configuration.scopes.includes(newScope.trim())) {
      configuration.scopes = [...configuration.scopes, newScope.trim()];
      newScope = "";
      updateOAuthData();
    }
  };

  // Remove scope from the list
  const removeScope = (index: number) => {
    configuration.scopes = configuration.scopes.filter((_, i) => i !== index);
    updateOAuthData();
  };

  // Handle Enter key for adding scope
  const handleScopeKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addScope();
    }
  };

  // Update oAuthData and send to callback
  const updateOAuthData = () => {
    const updatedData = {
      ...oAuthData,
      configuration: { ...configuration },
    };
    callback(updatedData);
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    configuration = {
      ...configuration,
      [field]: value,
    };
    updateOAuthData();
  };

  // Generate Token - Initiate OAuth flow
  const generateToken = async () => {
    if (!configuration.clientId || !configuration.AuthUrl) {
      tokenError = "Please fill in Client ID and Authorization URL";
      return;
    }

    isGeneratingToken = true;
    tokenError = "";

    try {
      // Build authorization URL with parameters
      const params = new URLSearchParams({
        client_id: configuration.clientId,
        redirect_uri:
          configuration.callbackUrl || window.location.origin + "/callback",
        response_type:
          configuration.grantType === "implicit" ? "token" : "code",
        scope: configuration.scopes.join(" "),
        state: configuration.state || generateState(),
      });

      // Save current state to localStorage for callback handling
      localStorage.setItem(
        "oauth_pending",
        JSON.stringify({
          configuration,
          timestamp: Date.now(),
        }),
      );

      // Redirect to authorization URL
      window.location.href = `${configuration.AuthUrl}?${params.toString()}`;
    } catch (error) {
      tokenError = `Error initiating OAuth: ${error.message}`;
      isGeneratingToken = false;
    }
  };

  // Generate a random state for CSRF protection
  const generateState = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  // Handle OAuth callback (check on component mount)
  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
      tokenError = `OAuth Error: ${error}`;
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (code) {
      // Exchange code for token
      await exchangeCodeForToken(code, state);
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code: string, state: string) => {
    try {
      const response = await fetch(configuration.AccessTokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: configuration.grantType,
          code: code,
          redirect_uri:
            configuration.callbackUrl || window.location.origin + "/callback",
          client_id: configuration.clientId,
          client_secret: configuration.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error("Token exchange failed");
      }

      const tokenData = await response.json();

      // Add token to the tokens array
      const newToken = {
        id: Date.now().toString(),
        name: configuration.tokenName || `Token ${oAuthData.tokens.length + 1}`,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
        scope: tokenData.scope,
        createdAt: new Date().toISOString(),
      };

      const updatedData = {
        ...oAuthData,
        tokens: [...oAuthData.tokens, newToken],
        selectToken: newToken.id,
      };

      callback(updatedData);
      isGeneratingToken = false;
    } catch (error) {
      tokenError = `Token exchange error: ${error.message}`;
      isGeneratingToken = false;
    }
  };

  // Check for callback on mount
  import { onMount } from "svelte";
  onMount(() => {
    handleCallback();
  });

  $: console.log(
    "OAuth Data:",
    oAuthData,
    "Environment Variables:",
    environmentVariables,
  );
</script>

<div class="oauth-container">
  <div class="header">
    <h3>OAuth 2.0 Configuration</h3>
    <p class="description">Configure your OAuth 2.0 authentication settings</p>
  </div>

  {#if tokenError}
    <div class="error-banner">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
          stroke="currentColor"
          stroke-width="2"
        />
        <path
          d="M10 6V10"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <circle cx="10" cy="13.5" r="0.75" fill="currentColor" />
      </svg>
      <span>{tokenError}</span>
    </div>
  {/if}

  <div class="form-section">
    <!-- Token Name -->
    <div class="form-group">
      <label for="tokenName">Token Name</label>
      <input
        id="tokenName"
        type="text"
        placeholder="My OAuth Token"
        bind:value={configuration.tokenName}
        on:input={() => updateOAuthData()}
      />
    </div>

    <!-- Client ID -->
    <div class="form-group">
      <label for="clientId">
        Client ID <span class="required">*</span>
      </label>
      <input
        id="clientId"
        type="text"
        placeholder="your-client-id"
        bind:value={configuration.clientId}
        on:input={() => updateOAuthData()}
      />
    </div>

    <!-- Client Secret -->
    <div class="form-group">
      <label for="clientSecret">Client Secret</label>
      <input
        id="clientSecret"
        type="password"
        placeholder="your-client-secret"
        bind:value={configuration.clientSecret}
        on:input={() => updateOAuthData()}
      />
    </div>

    <!-- Authorization URL -->
    <div class="form-group">
      <label for="authUrl">
        Authorization URL <span class="required">*</span>
      </label>
      <input
        id="authUrl"
        type="url"
        placeholder="https://provider.com/oauth/authorize"
        bind:value={configuration.AuthUrl}
        on:input={() => updateOAuthData()}
      />
    </div>

    <!-- Access Token URL -->
    <div class="form-group">
      <label for="tokenUrl">Access Token URL</label>
      <input
        id="tokenUrl"
        type="url"
        placeholder="https://provider.com/oauth/token"
        bind:value={configuration.AccessTokenUrl}
        on:input={() => updateOAuthData()}
      />
    </div>

    <!-- Callback URL -->
    <div class="form-group">
      <label for="callbackUrl">Callback URL</label>
      <input
        id="callbackUrl"
        type="url"
        placeholder={window.location.origin + "/callback"}
        bind:value={configuration.callbackUrl}
        on:input={() => updateOAuthData()}
      />
      <span class="hint"
        >This must match the URL registered with your OAuth provider</span
      >
    </div>

    <!-- State -->
    <div class="form-group">
      <label for="state">State (Optional)</label>
      <input
        id="state"
        type="text"
        placeholder="Random string for CSRF protection"
        bind:value={configuration.state}
        on:input={() => updateOAuthData()}
      />
    </div>

    <!-- Grant Type -->
    <div class="form-group">
      <label for="grantType">Grant Type</label>
      <select
        id="grantType"
        bind:value={configuration.grantType}
        on:change={() => updateOAuthData()}
      >
        {#each grantTypes as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
    </div>

    <!-- Add To -->
    <div class="form-group">
      <label for="addTo">Add Token To</label>
      <select
        id="addTo"
        bind:value={configuration.addTo}
        on:change={() => updateOAuthData()}
      >
        {#each addToOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>

    <!-- Scopes -->
    <div class="form-group">
      <label for="scopes">Scopes</label>
      <div class="scope-input-wrapper">
        <input
          id="scopes"
          type="text"
          placeholder="Enter scope and press Enter or click Add"
          bind:value={newScope}
          on:keypress={handleScopeKeyPress}
        />
        <button type="button" class="add-scope-btn" on:click={addScope}>
          Add
        </button>
      </div>

      {#if configuration.scopes.length > 0}
        <div class="scope-tags">
          {#each configuration.scopes as scope, index}
            <span class="scope-tag">
              {scope}
              <button
                type="button"
                class="remove-scope"
                on:click={() => removeScope(index)}
              >
                ×
              </button>
            </span>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Generate Token Button -->
    <div class="form-actions">
      <button
        type="button"
        class="generate-token-btn"
        on:click={generateToken}
        disabled={isGeneratingToken ||
          !configuration.clientId ||
          !configuration.AuthUrl}
      >
        {#if isGeneratingToken}
          Generating...
        {:else}
          Generate Token
        {/if}
      </button>
    </div>
  </div>

  <!-- Display Tokens -->
  {#if oAuthData.tokens && oAuthData.tokens.length > 0}
    <div class="tokens-section">
      <h4>Available Tokens</h4>
      <div class="tokens-list">
        {#each oAuthData.tokens as token}
          <div
            class="token-card"
            class:selected={oAuthData.selectToken === token.id}
          >
            <div class="token-header">
              <h5>{token.name}</h5>
              <span class="token-type">{token.tokenType || "Bearer"}</span>
            </div>
            <div class="token-details">
              <div class="token-field">
                <span class="token-label">Access Token:</span>
                <code class="token-value"
                  >{token.accessToken.substring(0, 30)}...</code
                >
              </div>
              {#if token.expiresIn}
                <div class="token-field">
                  <span class="token-label">Expires In:</span>
                  <span>{token.expiresIn} seconds</span>
                </div>
              {/if}
              <div class="token-field">
                <span class="token-label">Created:</span>
                <span>{new Date(token.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <button
              type="button"
              class="select-token-btn"
              on:click={() => {
                const updatedData = { ...oAuthData, selectToken: token.id };
                callback(updatedData);
              }}
            >
              {oAuthData.selectToken === token.id ? "Selected" : "Select Token"}
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .oauth-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
  }

  .header {
    margin-bottom: 24px;
  }

  .header h3 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }

  .description {
    color: #666;
    font-size: 14px;
    margin: 0;
  }

  .error-banner {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 6px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    color: #c33;
  }

  .form-section {
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 24px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }

  .required {
    color: #e74c3c;
  }

  input[type="text"],
  input[type="password"],
  input[type="url"],
  select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .hint {
    display: block;
    font-size: 12px;
    color: #888;
    margin-top: 4px;
  }

  .scope-input-wrapper {
    display: flex;
    gap: 8px;
  }

  .scope-input-wrapper input {
    flex: 1;
  }

  .add-scope-btn {
    padding: 10px 20px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .add-scope-btn:hover {
    background: #4f46e5;
  }

  .scope-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .scope-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    color: #374151;
  }

  .remove-scope {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .remove-scope:hover {
    color: #ef4444;
  }

  .form-actions {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e5e5e5;
  }

  .generate-token-btn {
    width: 100%;
    padding: 12px 24px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .generate-token-btn:hover:not(:disabled) {
    background: #059669;
  }

  .generate-token-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .tokens-section {
    margin-top: 24px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 24px;
  }

  .tokens-section h4 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 16px 0;
  }

  .tokens-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .token-card {
    border: 2px solid #e5e5e5;
    border-radius: 8px;
    padding: 16px;
    transition: border-color 0.2s;
  }

  .token-card.selected {
    border-color: #6366f1;
    background: #f8f9ff;
  }

  .token-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .token-header h5 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }

  .token-type {
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
  }

  .token-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .token-field {
    display: flex;
    gap: 8px;
    font-size: 13px;
  }

  .token-label {
    font-weight: 500;
    color: #666;
  }

  .token-value {
    background: #f9fafb;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    color: #374151;
  }

  .select-token-btn {
    width: 100%;
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #6366f1;
    color: #6366f1;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .select-token-btn:hover {
    background: #6366f1;
    color: white;
  }

  .token-card.selected .select-token-btn {
    background: #6366f1;
    color: white;
  }
</style>
