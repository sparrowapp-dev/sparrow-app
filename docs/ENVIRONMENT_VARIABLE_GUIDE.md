# Environment Variables Guide

This guide provides an overview of the environment variables used in the Sparrow - Web, Admin, API, Proxy and Auth Server.

### Important points to note:

- Emails are a necessary part of Sparrow. SMTP settings are mandatory for below features,

  - New user registration
  - Teams and collaboration
  - a lot more

- You get one user created by default,

  - Email: `dev@sparrow.com`
  - Password: `12345678@`

## **1. MongoDB Environment Variables**

These variables are used to configure the MongoDB database.

| Variable Name                | Description                    | Default Value |
| ---------------------------- | ------------------------------ | ------------- |
| `MONGO_INITDB_ROOT_USERNAME` | The root username for MongoDB. | `sparowapp`   |
| `MONGO_INITDB_ROOT_PASSWORD` | The root password for MongoDB. | `sparrow123`  |

---

## **2. Sparrow-API Environment Variables**

These variables configure the Sparrow API server.

### **Core Application Settings**

| Variable Name | Description                                      | Default Value      |
| ------------- | ------------------------------------------------ | ------------------ |
| `PORT`        | Port on which the API server runs.               | `9000`             |
| `APP_ENV`     | Environment mode (e.g., DEV, PROD).              | `DEV`              |
| `APP_URL`     | Base URL of the application.                     | `http://localhost` |
| `APP_EDITION` | Edition of the application (MANAGED/SELFHOSTED). | `SELFHOSTED`       |

### **Authentication Settings**

| Variable Name         | Description                                | Default Value         |
| --------------------- | ------------------------------------------ | --------------------- |
| `JWT_SECRET_KEY`      | Secret key for JWT token generation.       | `webtoken-secret-key` |
| `JWT_EXPIRATION_TIME` | Expiration time for JWT tokens in seconds. | `2400`                |

### **Database Settings**

| Variable Name | Description             | Default Value                                |
| ------------- | ----------------------- | -------------------------------------------- |
| `DB_URL`      | MongoDB connection URL. | `mongodb://sparowapp:sparrow123@mongo:27017` |
| `DB_NAME`     | MongoDB database name.  | `sparrow`                                    |

### **Email Settings**

| Variable Name          | Description                              | Default Value |
| ---------------------- | ---------------------------------------- | ------------- |
| `SMTP_ENABLED`         | Enables SMTP for sending emails.         | `false`       |
| `SMTP_SENDER_EMAIL`    | Email address of the sender.             |               |
| `SMTP_SENDER_PASSWORD` | Password for the sender's email account. |               |
| `SMTP_MAIL_HOST`       | SMTP mail host.                          |               |
| `SMTP_MAIL_PORT`       | SMTP mail port.                          |               |
| `SMTP_MAIL_SECURE`     | Enables secure SMTP.                     |               |
| `SMTP_USER_NAME`       | SMTP username.                           |               |

### **Self Host Admin Settings**

| Variable Name              | Description                               | Default Value               |
| -------------------------- | ----------------------------------------- | --------------------------- |
| `SELF_HOST_ADMIN_EMAIL`    | Admin email for registering new users.    | `sparrow-admin@yopmail.com` |
| `SELF_HOST_ADMIN_PASSWORD` | Admin password for registering new users. | `sparrow-admin-password`    |

### **Optional Settings**

#### Google OAuth

| Variable Name          | Description                            | Default Value |
| ---------------------- | -------------------------------------- | ------------- |
| `ENABLE_GOOGLE_AUTH`   | Enables Google OAuth login.            | `false`       |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID.                |               |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret.            |               |
| `GOOGLE_APP_URL`       | Google OAuth application URL.          |               |
| `LOGIN_REDIRECT_URL`   | Redirect URL after Google OAuth login. |               |
| `GOOGLE_ACCESS_TYPE`   | Google OAuth access type.              |               |

#### Email Validation

| Variable Name                       | Description                                   | Default Value |
| ----------------------------------- | --------------------------------------------- | ------------- |
| `EMAIL_VALIDATION_CODE_EXPIRY_TIME` | Expiry time for email validation codes/links. |               |

#### Refresh Token Settings

| Variable Name                   | Description                                    | Default Value          |
| ------------------------------- | ---------------------------------------------- | ---------------------- |
| `REFRESH_TOKEN_SECRET_KEY`      | Secret key for refresh tokens.                 | `refresh-token-secret` |
| `REFRESH_TOKEN_EXPIRATION_TIME` | Expiration time for refresh tokens in seconds. | `604800`               |
| `REFRESH_TOKEN_MAX_LIMIT`       | Maximum number of refresh tokens per user.     | `50`                   |

#### App Updater Settings

| Variable Name                     | Description                                  | Default Value |
| --------------------------------- | -------------------------------------------- | ------------- |
| `APP_UPDATE_AVAILABLE`            | Enables automatic app updates.               | `false`       |
| `APP_VERSION`                     | Current app version.                         |               |
| `WINDOWS_APP_SIGNATURE`           | Signature for Windows app updates.           |               |
| `WINDOWS_APP_URL`                 | URL for Windows app updates.                 |               |
| `MAC_APPLE_SILICON_APP_SIGNATURE` | Signature for Mac Apple Silicon app updates. |               |
| `MAC_APPLE_SILICON_APP_URL`       | URL for Mac Apple Silicon app updates.       |               |
| `MAC_INTEL_APP_SIGNATURE`         | Signature for Mac Intel app updates.         |               |
| `MAC_INTEL_APP_URL`               | URL for Mac Intel app updates.               |               |

#### Support Settings

| Variable Name   | Description            | Default Value              |
| --------------- | ---------------------- | -------------------------- |
| `SPARROW_EMAIL` | Support email address. | `contactus@sparrowapp.dev` |

#### Auth & Marketing URLs

| Variable Name        | Description                     | Default Value           |
| -------------------- | ------------------------------- | ----------------------- |
| `AUTH_BASE_URL`      | Auth website redirect base URL. | `http://localhost:1421` |
| `MARKETING_BASE_URL` | Marketing website base URL.     | `http://localhost:1422` |

#### Azure Services Settings

| Variable Name                      | Description                        | Default Value |
| ---------------------------------- | ---------------------------------- | ------------- |
| `AZURE_CONNECTION_STRING`          | Azure connection string.           |               |
| `AZURE_INSIGHTS_CONNECTION_STRING` | Azure Insights connection string.  |               |
| `FEEDBACK_BLOB_CONTAINER`          | Azure Blob container for feedback. |               |

#### AI Support Settings

| Variable Name                      | Description                           | Default Value |
| ---------------------------------- | ------------------------------------- | ------------- |
| `AZURE_OPENAI_ENDPOINT`            | Azure OpenAI endpoint.                |               |
| `AZURE_OPENAI_API_KEY`             | Azure OpenAI API key.                 |               |
| `AZURE_OPENAI_DEPLOYMENT`          | Azure OpenAI deployment name.         |               |
| `AZURE_OPENAI_API_VERSION`         | Azure OpenAI API version.             |               |
| `AZURE_OPENAI_MAX_TOKENS`          | Maximum tokens for Azure OpenAI.      |               |
| `AZURE_OPENAI_MONTHLY_TOKEN_LIMIT` | Monthly token limit for Azure OpenAI. |               |
| `AZURE_OPENAI_ASSISTANT_ID`        | Azure OpenAI Assistant ID.            |               |
| `DEEPSEEK_ENDPOINT`                | DeepSeek endpoint.                    |               |
| `DEEPSEEK_API_KEY`                 | DeepSeek API key.                     |               |
| `DEEPSEEK_API_VERSION`             | DeepSeek API version.                 |               |

#### Hubspot Integration

| Variable Name                 | Description                 | Default Value |
| ----------------------------- | --------------------------- | ------------- |
| `HUBSPOT_BASEURL`             | Hubspot base URL.           |               |
| `HUBSPOT_INTEGRATION_ENABLED` | Enable Hubspot integration. |               |
| `HUBSPOT_PORTALID`            | Hubspot portal ID.          |               |
| `HUBSPOT_FORMID`              | Hubspot form ID.            |               |

#### Beehiiv Integration

| Variable Name            | Description             | Default Value |
| ------------------------ | ----------------------- | ------------- |
| `BEEHIIV_API_KEY`        | Beehiiv API key.        |               |
| `BEEHIIV_PUBLICATION_ID` | Beehiiv publication ID. |               |

#### User Whitelist

| Variable Name           | Description              | Default Value |
| ----------------------- | ------------------------ | ------------- |
| `WHITELIST_USER_EMAILS` | Whitelisted user emails. |               |

#### Sentry

| Variable Name            | Description             | Default Value |
| ------------------------ | ----------------------- | ------------- |
| `SENTRY_DSN_KEY`         | Sentry DSN key.         |               |
| `SENTRY_APP_ENVIRONMENT` | Sentry app environment. |               |

#### Stripe

| Variable Name            | Description             | Default Value |
| ------------------------ | ----------------------- | ------------- |
| `STRIPE_WEBHOOK`         | Stripe webhook URL.     |               |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key. |               |
| `STRIPE_SECRET_KEY`      | Stripe secret key.      |               |

---

## **3. Sparrow-Auth Environment Variables**

These variables configure the Sparrow Auth service.

| Variable Name                    | Description                                              | Default Value                                    |
| -------------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| `AUTH_SERVICE_PORT`              | Port on which the Auth service runs.                     | `80`                                             |
| `JWT_SECRET`                     | Secret key for JWT token generation in the Auth service. | `auth-jwt-secret`                                |
| `DB_URL`                         | MongoDB connection URL for the Auth service.             | `mongodb://sparowapp:sparrow123@mongo:27017`     |
| `VITE_API_URL`                   | URL of the Sparrow API.                                  | `http://localhost:9000`                          |
| `VITE_SPARROW_SUPPORT_EMAIL`     | Support email address for the Auth service.              | `support@example.dev`                            |
| `VITE_SPARROW_OAUTH`             | OAuth callback URL for Google authentication.            | `http://localhost:9000/api/auth/google/callback` |
| `VITE_ENABLE_MIX_PANEL`          | Enables Mixpanel integration.                            | `false`                                          |
| `VITE_MIX_PANEL_TOKEN`           | Mixpanel token.                                          |                                                  |
| `VITE_TERMS_OF_SERVICE`          | URL for the terms of service.                            | `https://example.dev/termsandconditions`         |
| `VITE_SPARROW_WEB_URL`           | URL for the Sparrow web application.                     | `http://localhost:1422`                          |
| `VITE_SPARROW_ADMIN_URL`         | URL for the Sparrow Admin application.                   | `http://localhost:5173`                          |
| `VITE_SPARROW_PRIVACY_POLICY`    | URL for the privacy policy.                              | `https://example.com/privacy-policy`             |
| `VITE_APP_EDITION`               | Edition of the application.                              | `SELFHOSTED`                                     |
| `VITE_SPARROW_MARKETING_URL`     | Marketing website URL.                                   | `http://localhost:1452`                          |
| `VITE_CANNY_FEEDBACK_URL`        | Canny.io feedback portal URL.                            | `https://sparrowapp.canny.io/feedback`           |
| `VITE_SPARROW_CONTACT_SALES_URL` | Contact sales URL.                                       |                                                  |

---

## **4. Sparrow-Web Environment Variables**

These variables configure the Sparrow Web service.

| Variable Name                               | Description                                             | Default Value                                                      |
| ------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| `VITE_WEB_API_URL`                          | Base URL for the Sparrow Web API.                       | `N/A`                                                              |
| `VITE_WEB_SOCKET_IO_API_URL`                | Socket.IO API URL for Sparrow Web.                      | `http://localhost:9001`                                            |
| `VITE_WEB_SPARROW_SUPPORT_EMAIL`            | Support email for Sparrow Web service inquiries.        | `support@example.dev`                                              |
| `VITE_WEB_SPARROW_OAUTH`                    | Google OAuth callback URL.                              | `http://localhost:9000/api/auth/google/callback`                   |
| `VITE_WEB_ENABLE_MIX_PANEL`                 | Flag to enable or disable MixPanel analytics.           | `false`                                                            |
| `VITE_WEB_MIX_PANEL_TOKEN`                  | MixPanel authentication token.                          | `N/A`                                                              |
| `VITE_WEB_TERMS_OF_SERVICE`                 | Terms of Service URL.                                   | `https://example.dev/termsandconditions`                           |
| `VITE_WEB_BASE_URL`                         | Base URL for the Sparrow Web service.                   | `N/A`                                                              |
| `VITE_WEB_API_TIMEOUT`                      | Timeout duration for API requests in milliseconds.      | `7000`                                                             |
| `VITE_WEB_AUTH_URL`                         | URL for the authentication service.                     | `N/A`                                                              |
| `VITE_WEB_SPARROW_GITHUB`                   | GitHub repository link for Sparrow Web.                 | `https://github.com/sparrowapp-dev`                                |
| `VITE_WEB_SPARROW_LINKEDIN`                 | LinkedIn showcase page for Sparrow Web.                 | `https://www.linkedin.com/showcase/sparrow-app/`                   |
| `VITE_WEB_SPARROW_DOWNLOAD_LINK`            | URL to download Sparrow Web releases.                   | `https://github.com/sparrowapp-dev/sparrow-app/releases`           |
| `VITE_WEB_RELEASE_NOTES_PAT_TOKEN`          | Personal Access Token (PAT) for fetching release notes. | `N/A`                                                              |
| `VITE_WEB_RELEASE_NOTES_API`                | API endpoint for fetching release notes from GitHub.    | `https://api.github.com/repos/sparrowapp-dev/sparrow-app/releases` |
| `VITE_WEB_AZURE_INSIGHTS_CONNECTION_STRING` | Azure Application Insights connection string.           | `N/A`                                                              |
| `VITE_WEB_CANNY_API`                        | API key for integrating with Canny feedback system.     | `N/A`                                                              |
| `VITE_WEB_CANNY_URL`                        | Canny feedback system URL.                              | `N/A`                                                              |
| `VITE_WEB_MARKETING_URL`                    | Marketing website URL.                                  | `http://localhost:1429`                                            |
| `VITE_WEB_SPARROW_DOCS`                     | URL to Sparrow Web documentation.                       | `https://docs.sparrowapp.dev/docs/intro`                           |
| `VITE_WEB_PROXY_SERVICE`                    | URL for the Sparrow Proxy service.                      | `http://localhost:3000`                                            |
| `VITE_WEB_AZURE_CDN_URL`                    | Azure CDN URL for Sparrow Web.                          | `http://localhost:4500`                                            |
| `VITE_WEB_APP_ENVIRONMENT_PATH`             | App environment path.                                   | `local`                                                            |
| `VITE_WEB_SPARROW_AI_WEBSOCKET`             | WebSocket URL for Sparrow AI assistant.                 | `ws://localhost:9000/ai-assistant`                                 |
| `VITE_WEB_SENTRY_DSN`                       | Sentry DSN for error tracking.                          |                                                                    |
| `VITE_WEB_APP_ENVIRONMENT`                  | App environment name.                                   | `LOCAL-FE`                                                         |
| `VITE_WEB_SPARROW_WEB_APP_URL`              | Sparrow Web App URL.                                    | `http://localhost:1422`                                            |
| `VITE_WEB_SPARROW_ADMIN_URL`                | Sparrow Admin App URL.                                  | `http://localhost:5173`                                            |
| `VITE_WEB_POSTHOG_API_URL`                  | PostHog API URL.                                        |                                                                    |
| `VITE_WEB_POSTHOG_CONNECTION_API_KEY`       | PostHog connection API key.                             |                                                                    |
| `VITE_WEB_APP_EDITION`                      | Edition of the web app.                                 | `SELFHOSTED`                                                       |

---

## **5. Sparrow-Admin Environment Variables**

These variables configure the Sparrow Admin service.

| Variable Name                | Description                           | Default Value                             |
| ---------------------------- | ------------------------------------- | ----------------------------------------- |
| `VITE_SPARROW_LAUNCH_URL`    | Launch URL for Sparrow Web.           | `http://localhost:1422`                   |
| `VITE_API_BASE_URL`          | Base URL for Sparrow API.             | `http://localhost:9000`                   |
| `VITE_LOGIN_REDIRECT`        | Redirect URL after login.             | `http://localhost:1421/init?source=admin` |
| `VITE_SPARROW_DOCS_URL`      | Documentation URL.                    | `https://docs.sparrowapp.dev/docs/intro`  |
| `VITE_ENVIRONMENT`           | Environment (development/production). | `development`                             |
| `VITE_SPARROW_MARKETING_URL` | Marketing website URL.                | `https://sparrowapp.dev`                  |
| `VITE_APP_EDITION`           | Edition of the admin app.             | `SELFHOSTED`                              |
