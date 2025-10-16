export const predefinedTestSnippets = [
  {
    title: "Get Environment Variables",
    function: `sp.global.get("url");`,
  },
  {
    title: "Set Environment Variables",
    function: `sp.global.set("url", "https://jsonplaceholder.typicode.com/todos");`,
  },
  {
    title: "Get Local Variables",
    function: `sp.environment.get("url");`,
  },
  {
    title: "Set Local Variables",
    function: `sp.environment.set("url", "https://jsonplaceholder.typicode.com/todos");`,
  },
  {
    title: "Set Timestamp Variables",
    function: `sp.environment.set("timestamp", "10-08-23");`,
  },
  
];
