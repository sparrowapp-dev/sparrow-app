# Environment Variables Guide

This guide provides an overview of the environment variables used in the Sparrow application, including MongoDB, Kafka, Sparrow-API, and Sparrow-Auth configurations. Each section is categorized for clarity.

### Important points to note:

- Emails are a necessary part of Sparrow and SMTP settings are mandatory for below features,

  - New user registration
  - Teams and collaboration
  - a lot more

- You get one user created by default,

  - Email: `dev@sparrow.com`
  - Password: `12345678@`

-

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

| Variable Name | Description                         | Default Value      |
| ------------- | ----------------------------------- | ------------------ |
| `PORT`        | Port on which the API server runs.  | `9000`             |
| `APP_ENV`     | Environment mode (e.g., DEV, PROD). | `DEV`              |
| `APP_URL`     | Base URL of the application.        | `http://localhost` |

### **Authentication Settings**

| Variable Name         | Description                                | Default Value         |
| --------------------- | ------------------------------------------ | --------------------- |
| `JWT_SECRET_KEY`      | Secret key for JWT token generation.       | `webtoken-secret-key` |
| `JWT_EXPIRATION_TIME` | Expiration time for JWT tokens in seconds. | `2400`                |

### **Database Settings**

| Variable Name | Description             | Default Value                                |
| ------------- | ----------------------- | -------------------------------------------- |
| `DB_URL`      | MongoDB connection URL. | `mongodb://sparowapp:sparrow123@mongo:27017` |

### **Kafka Broker Settings**

| Variable Name  | Description           | Default Value |
| -------------- | --------------------- | ------------- |
| `KAFKA_BROKER` | Kafka broker address. | `kafka:9094`  |

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

#### Email Settings

| Variable Name          | Description                              | Default Value |
| ---------------------- | ---------------------------------------- | ------------- |
| `SMTP_ENABLED`         | Enables SMTP for sending emails.         | `false`       |
| `SMTP_SENDER_EMAIL`    | Email address of the sender.             |               |
| `SMTP_SENDER_PASSWORD` | Password for the sender's email account. |               |
| `SMTP_MAIL_HOST`       | SMTP mail host.                          |               |
| `SMTP_MAIL_PORT`       | SMTP mail port.                          |               |
| `SMTP_MAIL_SECURE`     | Enables secure SMTP.                     |               |
| `SMTP_USER_NAME`       | SMTP username.                           |               |

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

---

## **4. Sparrow-Auth Environment Variables**

These variables configure the Sparrow Auth service.

| Variable Name                 | Description                                              | Default Value                                    |
| ----------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| `AUTH_SERVICE_PORT`           | Port on which the Auth service runs.                     | `80`                                             |
| `JWT_SECRET`                  | Secret key for JWT token generation in the Auth service. | `auth-jwt-secret`                                |
| `DB_URL`                      | MongoDB connection URL for the Auth service.             | `mongodb://sparowapp:sparrow123@localhost:27017` |
| `VITE_API_URL`                | URL of the Sparrow API.                                  | `http://localhost:9000`                          |
| `VITE_SPARROW_SUPPORT_EMAIL`  | Support email address for the Auth service.              | `support@example.dev`                            |
| `VITE_SPARROW_OAUTH`          | OAuth callback URL for Google authentication.            | `http://localhost:9000/api/auth/google/callback` |
| `VITE_ENABLE_MIX_PANEL`       | Enables Mixpanel integration.                            | `false`                                          |
| `VITE_MIX_PANEL_TOKEN`        | Mixpanel token.                                          |                                                  |
| `VITE_TERMS_OF_SERVICE`       | URL for the terms of service.                            | `https://example.dev/termsandconditions`         |
| `VITE_SPARROW_WEB_URL`        | URL for the Sparrow web application.                     | `http://localhost:1422`                          |
| `VITE_SPARROW_PRIVACY_POLICY` | URL for the privacy policy.                              | `https://example.com/privacy-policy`             |
