const constants = {
  API_URL: import.meta.env.VITE_API_URL,
  ENABLE_MIX_PANEL: import.meta.env.VITE_ENABLE_MIX_PANEL,
  MIX_PANEL_TOKEN: import.meta.env.VITE_MIX_PANEL_TOKEN,
  API_SEND_TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
  RXDB_DB_NAME: "sparrow-db",
  AUTH_TOKEN: "AUTH_TOKEN",
  REF_TOKEN: "REF_TOKEN",
  WORKSPACE_LIMIT: 5,
  API_LIMIT: 5,
  SPARROW_SUPPORT_EMAIL: import.meta.env.VITE_SPARROW_SUPPORT_EMAIL,
  SPARROW_AUTH_URL: import.meta.env.VITE_AUTH_URL,
  SPARROW_GITHUB: import.meta.env.VITE_SPARROW_GITHUB,
  SPARROW_LINKEDIN: import.meta.env.VITE_SPARROW_LINKEDIN,
  SPARROW_DOWNLOAD_LINK: import.meta.env.VITE_SPARROW_DOWNLOAD_LINK,
  GITHUB_API: "https://api.github.com",
  RELEASE_NOTES_PAT_TOKEN: import.meta.env.VITE_RELEASE_NOTES_PAT_TOKEN,
  RELEASE_NOTES_API: import.meta.env.VITE_RELEASE_NOTES_API,
  AZURE_CDN_URL: import.meta.env.VITE_AZURE_CDN_URL,
  CANNY_API: import.meta.env.VITE_CANNY_API,
  CANNY_URL: import.meta.env.VITE_CANNY_URL,
  AZURE_INSIGHTS_CONNECTION_STRING: import.meta.env
    .VITE_AZURE_INSIGHTS_CONNECTION_STRING,
  BASE_URL: import.meta.env.VITE_BASE_URL,
  DOCS_URL: import.meta.env.VITE_SPARROW_DOCS,
  SPARROW_AI_WEBSOCKET_URL: import.meta.env.VITE_SPARROW_AI_WEBSOCKET
};

export default constants;
