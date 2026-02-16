/**
 * OAuth2TokenService
 * Handles OAuth2 token acquisition for different grant types
 */

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
  callbackUrl?: string;
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
    params: OAuth2ClientCredentialsParams
  ): Promise<OAuth2TokenResponse> {
    const { clientId, clientSecret, accessTokenUrl, scope } = params;

    if (!clientId || !clientSecret || !accessTokenUrl) {
      throw new Error("Missing required parameters for Client Credentials flow");
    }

    // Prepare the request body
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
        throw new Error(`Token request failed: ${response.status} - ${errorText}`);
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
   * This requires browser interaction for user authorization
   */
  async getTokenAuthorizationCode(
    params: OAuth2AuthorizationCodeParams
  ): Promise<OAuth2TokenResponse> {
    const { clientId, clientSecret, authUrl, accessTokenUrl, callbackUrl, scope, state } = params;

    if (!clientId || !clientSecret || !authUrl || !accessTokenUrl) {
      throw new Error("Missing required parameters for Authorization Code flow");
    }

    const redirectUri = callbackUrl || this.getDefaultRedirectUri();

    try {
      // Step 1: Get authorization code via browser
      const authorizationCode = await this.getAuthorizationCode({
        authUrl,
        clientId,
        redirectUri,
        scope,
        state,
      });

      if (!authorizationCode) {
        throw new Error("Failed to obtain authorization code");
      }

      // Step 2: Exchange authorization code for access token
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      });

      if (scope) {
        body.append("scope", scope);
      }

      const response = await fetch(accessTokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      return tokenData as OAuth2TokenResponse;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Authorization Code flow failed: ${err.message}`);
    }
  }

  /**
   * Opens authorization URL in browser and captures the authorization code
   */
  private async getAuthorizationCode(params: {
    authUrl: string;
    clientId: string;
    redirectUri: string;
    scope?: string;
    state?: string;
  }): Promise<string> {
    const { authUrl, clientId, redirectUri, scope, state } = params;

    // Build authorization URL
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

    const fullAuthUrl = `${authUrl}?${authUrlParams.toString()}`;

    return new Promise((resolve, reject) => {
      // Open popup window for authorization
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        fullAuthUrl,
        "OAuth2 Authorization",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no`
      );

      if (!popup) {
        reject(new Error("Failed to open authorization popup. Please allow popups for this site."));
        return;
      }

      // Listen for the redirect callback
      const messageHandler = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === "oauth2_callback") {
          window.removeEventListener("message", messageHandler);
          popup.close();

          if (event.data.code) {
            resolve(event.data.code);
          } else if (event.data.error) {
            reject(new Error(`Authorization failed: ${event.data.error}`));
          } else {
            reject(new Error("No authorization code received"));
          }
        }
      };

      window.addEventListener("message", messageHandler);

      // Check if popup was closed without completing authorization
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener("message", messageHandler);
          reject(new Error("Authorization cancelled by user"));
        }
      }, 1000);
    });
  }

  /**
   * Get the default redirect URI for OAuth2 callback
   */
  private getDefaultRedirectUri(): string {
    // For web app, use a callback page in the same origin
    return `${window.location.origin}/oauth2-callback.html`;
  }
}
