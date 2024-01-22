const constants = {
  API_URL: import.meta.env.VITE_API_URL,
  ENABLE_MIX_PANEL: import.meta.env.VITE_ENABLE_MIX_PANEL,
  MIX_PANEL_TOKEN: import.meta.env.VITE_MIX_PANEL_TOKEN,
  API_SEND_TIMEOUT: 5000,
  RXDB_DB_NAME: "sparrow-db",
  AUTH_TOKEN: "AUTH_TOKEN",
  REF_TOKEN: "REF_TOKEN",
  WORKSPACE_LIMIT: 5,
  API_LIMIT: 5,
};

export default constants;
