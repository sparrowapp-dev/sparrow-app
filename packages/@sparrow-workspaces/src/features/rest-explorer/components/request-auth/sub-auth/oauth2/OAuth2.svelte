<script lang="ts">
  import { CodeMirrorInput } from "@sparrow/workspaces/components";
  import { AuthInputTheme } from "@sparrow/workspaces/utils";
  import {
    RadioButton,
    Button,
    notifications,
    Modal,
    Dropdown,
  } from "@sparrow/library/ui";
  import { CopyIcon2, BroomRegular, SaveRegular } from "@sparrow/library/icons";
  import { copyToClipBoard } from "@sparrow/common/utils";
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

  // Modal states for copy/clear/save functionality
  let showClearConfirmation = false;
  let showSaveModal = false;
  let showOverwriteWarning = false;
  let isEnvironmentDropdownOpen = false; // Dropdown state

  // Save to environment variables
  let variableName = "OAUTH_TOKEN";
  let selectedEnvironmentType: any = "GLOBAL";
  let selectedEnvironmentId: string = ""; // For local environment selection
  let existingVariableIndex = -1;

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

  // Copy token to clipboard
  const handleCopyToken = async () => {
    try {
      await copyToClipBoard(oauth2Data.accessToken);
      notifications.success("Token copied to clipboard");
    } catch (error) {
      console.error("Error copying token:", error);
      notifications.error("Failed to copy token");
    }
  };

  // Open clear confirmation modal
  const handleClearClick = () => {
    showClearConfirmation = true;
  };

  // Clear token after confirmation
  const handleClearToken = () => {
    oauth2Data.accessToken = "";
    handleAuthChange();
    showClearConfirmation = false;
    notifications.success("Token cleared");
  };

  // Open save to environment modal
  const handleSaveClick = () => {
    // Default to active local env if exists, otherwise global
    if (environmentVariables.local) {
      selectedEnvironmentType = "LOCAL";
      selectedEnvironmentId = environmentVariables.local._data.id;
    } else {
      selectedEnvironmentType = "GLOBAL";
      selectedEnvironmentId = environmentVariables.global?._data.id || "";
    }
    showSaveModal = true;
  };

  // Check if variable exists in selected environment
  const checkVariableExists = (
    varName: string,
    isGlobal: boolean,
    envId?: string,
  ): number => {
    let targetEnv;
    if (isGlobal) {
      targetEnv = environmentVariables.global;
    } else {
      // Find the specific local environment by ID
      if (envId) {
        targetEnv =
          environmentVariables.allLocalEnvironments.find(
            (env) => env.id === envId,
          ) || environmentVariables.local;
      } else {
        targetEnv = environmentVariables.local;
      }
    }
    if (!targetEnv || !targetEnv.variable) return -1;

    return targetEnv.variable.findIndex((v: any) => v.key === varName);
  };

  // Handle save to environment
  const handleSaveToEnvironment = () => {
    const isGlobal = selectedEnvironmentType === "GLOBAL";
    const trimmedName = variableName.trim();

    // Validate variable name
    if (!trimmedName) {
      notifications.error("Variable name cannot be empty");
      return;
    }

    // Validate variable name format (alphanumeric and underscore only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedName)) {
      notifications.error(
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
      );
      return;
    }

    // Check if variable already exists
    existingVariableIndex = checkVariableExists(
      trimmedName,
      isGlobal,
      selectedEnvironmentId,
    );

    if (existingVariableIndex !== -1) {
      showOverwriteWarning = true;
      return;
    }

    // Save new variable
    saveVariable(isGlobal);
  };

  // Save variable to environment
  const saveVariable = (
    isGlobal: boolean,
    existingVariableIndex: number = -1,
  ) => {
    try {
      // If saving to a specific local environment, update environmentVariables.local
      let targetEnvVariables = environmentVariables;
      if (!isGlobal && selectedEnvironmentId) {
        const targetEnv = environmentVariables.allLocalEnvironments.find(
          (env) => env.id === selectedEnvironmentId,
        );
        if (targetEnv) {
          targetEnvVariables = {
            ...environmentVariables,
            local: targetEnv,
          };
        }
      }

      // If overwriting an existing variable, remove it first
      // (onUpdateEnvironment will add the new variable)
      if (existingVariableIndex !== -1) {
        // Get the appropriate variable array
        const variablesArray = isGlobal
          ? targetEnvVariables.global.variable
          : targetEnvVariables.local.variable;

        // Filter out the existing variable
        const filteredVariables = variablesArray.filter(
          (_, index) => index !== existingVariableIndex,
        );

        // Update the target environment with the filtered array
        if (isGlobal) {
          targetEnvVariables = {
            ...targetEnvVariables,
            global: {
              ...targetEnvVariables.global,
              variable: filteredVariables,
            },
          };
        } else {
          targetEnvVariables = {
            ...targetEnvVariables,
            local: {
              ...targetEnvVariables.local,
              variable: filteredVariables,
            },
          };
        }
      }

      // Create the new/updated variable
      const newVariable = {
        key: variableName.trim(),
        value: oauth2Data.accessToken,
        checked: true,
      };

      // onUpdateEnvironment will add the variable to the array
      onUpdateEnvironment(isGlobal, targetEnvVariables, newVariable);

      showSaveModal = false;
      showOverwriteWarning = false;
    } catch (error) {
      console.error("Error saving to environment:", error);
      notifications.error("Failed to save token to environment");
    }
  };

  // Handle overwrite confirmation
  const handleOverwriteConfirm = () => {
    const isGlobal = selectedEnvironmentType === "GLOBAL";
    saveVariable(isGlobal, existingVariableIndex);
  };

  // Environment dropdown options - include all local environments
  $: environmentOptions = [
    ...(environmentVariables.allLocalEnvironments &&
    environmentVariables.allLocalEnvironments.length > 0
      ? environmentVariables.allLocalEnvironments.map((env) => ({
          id: "LOCAL",
          label: env.name,
          envId: env.id,
        }))
      : []),
    {
      id: "GLOBAL",
      label: "Global Environment",
      envId: environmentVariables.global?.id || "",
    },
  ];

  // Get selected environment label
  $: selectedEnvironmentLabel =
    environmentOptions.find((opt) => opt.envId === selectedEnvironmentId)
      ?.label || "Select Environment";

  // Check if token actions should be disabled
  $: tokenActionsDisabled =
    disabled || !oauth2Data.accessToken || oauth2Data.accessToken.trim() === "";
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
          value={oauth2Data.accessToken}
          onUpdateInput={() => {}}
          placeholder="Token will appear here after clicking 'Get Access Token' or enter manually"
          {theme}
          disabled={true}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>

    <!-- Token Action Buttons -->
    {#if !disabled}
      <div class="d-flex gap-2 mt-3">
        <Button
          type="teritiary-regular"
          title="Copy"
          onClick={handleCopyToken}
          disable={tokenActionsDisabled}
          loader={false}
          startIcon={CopyIcon2}
          endIcon={undefined}
          size="small"
        />
        <Button
          type="teritiary-regular"
          title="Clear"
          onClick={handleClearClick}
          disable={tokenActionsDisabled}
          loader={false}
          startIcon={BroomRegular}
          endIcon={undefined}
          size="small"
        />
        <Button
          type="teritiary-regular"
          title="Save to Environment"
          onClick={handleSaveClick}
          disable={tokenActionsDisabled}
          loader={false}
          startIcon={SaveRegular}
          endIcon={undefined}
          size="small"
        />
      </div>
    {/if}
  </div>

  <!-- Clear Token Confirmation Modal -->
  <Modal
    isOpen={showClearConfirmation}
    title="Clear Access Token?"
    description="This will remove the current access token. You can refetch it anytime by clicking 'Get Access Token'."
    handleModalState={(flag) => (showClearConfirmation = flag)}
    onClickHelpIcon={() => {}}
    zIndex={1001}
    width="450px"
  >
    <div class="d-flex justify-content-end gap-2 mt-3">
      <Button
        type="teritiary-regular"
        title="Cancel"
        onClick={() => (showClearConfirmation = false)}
        disable={false}
        loader={false}
        size="small"
        startIcon={undefined}
        endIcon={undefined}
      />
      <Button
        type="primary"
        title="Clear"
        onClick={handleClearToken}
        disable={false}
        loader={false}
        size="small"
        startIcon={undefined}
        endIcon={undefined}
      />
    </div>
  </Modal>

  <!-- Save to Environment Modal -->
  <Modal
    isOpen={showSaveModal}
    title="Save Token to Environment"
    description="Choose a variable name and select the target environment"
    handleModalState={(flag) => (showSaveModal = flag)}
    onClickHelpIcon={() => {}}
    zIndex={1001}
    width="500px"
  >
    <div class="d-flex flex-column gap-3 mt-3">
      <div>
        <label for="oauth-var-name" class="text-fs-12 fw-bold mb-2 d-block"
          >Variable Name</label
        >
        <input
          id="oauth-var-name"
          type="text"
          bind:value={variableName}
          placeholder="OAUTH_TOKEN"
          class="form-control text-fs-12"
          style="max-width: 400px;"
        />
        <p
          class="text-fs-10 text-secondary-200 mt-1"
          style="font-style: italic;"
        >
          Use letters, numbers, and underscores only. Must start with a letter
          or underscore.
        </p>
      </div>

      <div>
        <p class="text-fs-12 fw-bold mb-2">Select Environment to Save Token</p>
        <div class="environment-dropdown-wrapper">
          <Dropdown
            buttonId="environment-type-dropdown"
            bind:isMenuOpen={isEnvironmentDropdownOpen}
            isBackgroundClickable={true}
            options={environmentOptions.map((opt) => ({
              name: opt.label,
              onclick: () => {
                selectedEnvironmentType = opt.id;
                selectedEnvironmentId = opt.envId || "";
                isEnvironmentDropdownOpen = false;
              },
              color: "",
            }))}
            minWidth={400}
            zIndex={1002}
          >
            <Button
              id="environment-type-dropdown"
              type="outline-secondary"
              title={selectedEnvironmentLabel}
              onClick={() => {
                isEnvironmentDropdownOpen = !isEnvironmentDropdownOpen;
              }}
              disable={false}
              loader={false}
              size="small"
              startIcon={undefined}
              endIcon={undefined}
            />
          </Dropdown>
        </div>
        {#if !environmentOptions || !environmentOptions.some((opt) => opt.id === "LOCAL")}
          <p class="text-fs-10 mt-1" style="color: var(--text-ds-neutral-400);">
            No local environment available. Token will be saved to global
            environment.
          </p>
        {/if}
      </div>

      <div class="d-flex justify-content-end gap-2 mt-2">
        <Button
          type="teritiary-regular"
          title="Cancel"
          onClick={() => (showSaveModal = false)}
          disable={false}
          loader={false}
          size="small"
          startIcon={undefined}
          endIcon={undefined}
        />
        <Button
          type="primary"
          title="Save"
          onClick={handleSaveToEnvironment}
          disable={!variableName.trim()}
          loader={false}
          size="small"
          startIcon={undefined}
          endIcon={undefined}
        />
      </div>
    </div>
  </Modal>

  <!-- Overwrite Warning Modal -->
  <Modal
    isOpen={showOverwriteWarning}
    title="Overwrite Environment Variable?"
    description={`Variable '${variableName.trim()}' already exists in the ${selectedEnvironmentType === "GLOBAL" ? "Global" : environmentOptions.find((opt) => opt.envId === selectedEnvironmentId)?.label || "selected"} environment. Do you want to replace it with the new token value?`}
    handleModalState={(flag) => (showOverwriteWarning = flag)}
    onClickHelpIcon={() => {}}
    zIndex={1003}
    width="500px"
  >
    <div class="d-flex justify-content-end gap-2 mt-3">
      <Button
        type="teritiary-regular"
        title="Cancel"
        onClick={() => {
          showOverwriteWarning = false;
          showSaveModal = true;
        }}
        disable={false}
        loader={false}
        size="small"
        startIcon={undefined}
        endIcon={undefined}
      />
      <Button
        type="primary"
        title="Replace"
        onClick={handleOverwriteConfirm}
        disable={false}
        loader={false}
        size="small"
        startIcon={undefined}
        endIcon={undefined}
      />
    </div>
  </Modal>
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

  .environment-dropdown-wrapper {
    width: 100%;
  }

  .environment-dropdown-wrapper :global(button) {
    width: 100%;
    justify-content: space-between;
    text-align: left;
  }
</style>
