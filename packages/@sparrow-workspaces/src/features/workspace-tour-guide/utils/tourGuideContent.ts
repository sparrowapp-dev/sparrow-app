export const defaultTourGuideContent = [
  {
    Title: "Manage Your API Requests",
    description:
      "Easily access, add and organize your API requests here. Use this panel to create, edit, or delete requests with just a few clicks.",
    stepCount: 1,
    tipPosition: "right-center",
    targetId: "collection-container",
  },
  {
    Title: "Your Environments",
    description:
      "Environments help you manage different API variables (e.g. development, staging, production).",
    stepCount: 2,
    tipPosition: "right-center",
    targetId: "Environment-container",
  },
  {
    Title: "Test Flows",
    description:
      "Use Test Flow to automate testing for your API requests. Chain multiple requests, validate responses, and ensure your APIs work as expected.",
    stepCount: 3,
    tipPosition: "right-center",
    targetId: "testflow-container",
  },
  {
    Title: "Switch Environments",
    description:
      "Need to test in a different environment? Use this menu to switch environments instantly.",
    stepCount: 4,
    tipPosition: "bottom-center",
    targetId: "environment-select-container",
    additionLeftvalue: -150,
  },
  {
    Title: "Navigate Between Workspaces",
    description:
      "Work with multiple projects? Easily switch between workspaces to keep your API requests and collections organized.",
    stepCount: 5,
    tipPosition: "bottom-center",
    additionLeftvalue: -30,
    targetId: "workspace-container",
  },
  {
    Title: "Add API Requests & More!",
    description:
      "Click here to create new requests (HTTP, GraphQL, WebSocket, Socket.IO) add & import collections, environments & test flows.",
    stepCount: 6,
    tipPosition: "right-center",
    targetId: "options-container",
  },
  {
    Title: "Quick Help!",
    description:
      "Access documentation and stay up to date with the latest features and improvements.",
    stepCount: 7,
    tipPosition: "bottom-center",
    additionLeftvalue: -210,
    targetId: "question-container",
  },
];

export const totalSteps = 7;
