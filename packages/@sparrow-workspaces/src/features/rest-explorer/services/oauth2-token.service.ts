/**
 * OAuth2TokenService
 * Handles OAuth2 token acquisition for different grant types
 */

const isTauri = "__TAURI_INTERNALS__" in window;

export interface OAuth2ClientCredentialsParams {
  clientId: string;
  clientSecret: string;
  accessTokenUrl: string;
  scope?: string;
}

export interface OAuth2AuthorizationCodeParams {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  accessTokenUrl: string;
  callbackUrl: string;
  scope?: string;
  state?: string;
}

export interface OAuth2TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export class OAuth2TokenService {
  /**
   * Get access token using Client Credentials grant type
   */
  async getTokenClientCredentials(
    params: OAuth2ClientCredentialsParams,
  ): Promise<OAuth2TokenResponse> {
    const { clientId, clientSecret, accessTokenUrl, scope } = params;

    if (!clientId || !clientSecret || !accessTokenUrl) {
      throw new Error(
        "Missing required parameters for Client Credentials flow",
      );
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    if (scope) {
      body.append("scope", scope);
    }

    try {
      const response = await fetch(accessTokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token request failed: ${response.status} - ${errorText}`,
        );
      }

      const tokenData = await response.json();
      return tokenData as OAuth2TokenResponse;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to obtain token: ${err.message}`);
    }
  }

  /**
   * Get access token using Authorization Code grant type
   */
  async getTokenAuthorizationCode(
    params: OAuth2AuthorizationCodeParams,
  ): Promise<OAuth2TokenResponse> {
    const {
      clientId,
      clientSecret,
      authUrl,
      accessTokenUrl,
      callbackUrl,
      scope,
      state,
    } = params;

    if (
      !clientId ||
      !clientSecret ||
      !authUrl ||
      !accessTokenUrl ||
      !callbackUrl
    ) {
      throw new Error(
        "Missing required parameters for Authorization Code flow",
      );
    }

    // Get authorization code
    const authorizationCode = await this.getAuthorizationCode({
      authUrl,
      clientId,
      redirectUri: callbackUrl,
      scope,
      state,
    });

    if (!authorizationCode) {
      throw new Error("Failed to obtain authorization code");
    }

    // Exchange authorization code for access token
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: authorizationCode,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
    });

    if (scope) {
      body.append("scope", scope);
    }

    try {
      const response = await fetch(accessTokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token exchange failed: ${response.status} - ${errorText}`,
        );
      }

      const tokenData = await response.json();
      return tokenData as OAuth2TokenResponse;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to exchange code for token: ${err.message}`);
    }
  }

  /**
   * Get authorization code using OAuth window
   */
  private async getAuthorizationCode(params: {
    authUrl: string;
    clientId: string;
    redirectUri: string;
    scope?: string;
    state?: string;
  }): Promise<string> {
    const { authUrl, clientId, redirectUri, scope, state } = params;

    // Build authorization URL - handle case where authUrl already has query params
    const authUrlParams = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
    });

    if (scope) {
      authUrlParams.append("scope", scope);
    }

    if (state) {
      authUrlParams.append("state", state);
    }

    // Use & if authUrl already has query params, otherwise use ?
    const separator = authUrl.includes("?") ? "&" : "?";
    const fullAuthUrl = `${authUrl}${separator}${authUrlParams.toString()}`;

    // For Tauri, use OAuth window
    if (isTauri) {
      return this.getAuthorizationCodeTauri(fullAuthUrl, redirectUri);
    }

    // For web, use popup window
    return this.getAuthorizationCodeWeb(fullAuthUrl);
  }

  /**
   * Get authorization code using Tauri OAuth window
   */
  private async getAuthorizationCodeTauri(
    authUrl: string,
    callbackUrl: string,
  ): Promise<string> {
    const { invoke } = await import("@tauri-apps/api/core");
    const { listen } = await import("@tauri-apps/api/event");

    return new Promise((resolve, reject) => {
      let unlisten: (() => void) | null = null;

      // Listen for OAuth callback event
      listen<{ code?: string; error?: string; state?: string }>(
        "oauth-callback-received",
        (event) => {
          if (unlisten) {
            unlisten();
          }

          if (event.payload.error) {
            reject(new Error(`Authorization failed: ${event.payload.error}`));
            return;
          }

          if (event.payload.code) {
            resolve(event.payload.code);
          } else {
            reject(new Error("No authorization code received"));
          }
        },
      ).then((fn) => {
        unlisten = fn;
      });

      // Open OAuth window
      invoke("open_oauth_window", {
        authUrl,
        callbackUrl,
      }).catch((error) => {
        console.error(
          "[OAuth Service] ERROR invoking open_oauth_window:",
          error,
        );
        if (unlisten) {
          unlisten();
        }
        reject(new Error(`Failed to open OAuth window: ${error}`));
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        if (unlisten) {
          unlisten();
        }
        reject(new Error("Authorization timeout"));
      }, 300000);
    });
  }

  /**
   * Get authorization code using web popup window
   */
  private async getAuthorizationCodeWeb(fullAuthUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Open popup window
      const width = 500;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        fullAuthUrl,
        "OAuth Authorization",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!popup) {
        reject(
          new Error(
            "Failed to open authorization popup. Please allow popups for this site.",
          ),
        );
        return;
      }

      // Listen for messages from popup
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === "oauth-callback") {
          window.removeEventListener("message", messageHandler);
          popup.close();

          if (event.data.error) {
            reject(new Error(`Authorization failed: ${event.data.error}`));
          } else if (event.data.code) {
            resolve(event.data.code);
          } else {
            reject(new Error("No authorization code received"));
          }
        }
      };

      window.addEventListener("message", messageHandler);

      // Check if popup was closed
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          window.removeEventListener("message", messageHandler);
          reject(new Error("Authorization cancelled by user"));
        }
      }, 1000);
    });
  }
}
