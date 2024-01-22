const generateSampleEnvironment = (
  id: string,
  workspaceId: string,
  date: string,
) => {
  return {
    id,
    name: "New Environment",
    variable: [
      {
        key: "",
        value: "",
        checked: true,
      },
    ],
    isActive: false,
    type: "LOCAL",
    isSave: true,
    isSaveInProgress: false,
    workspaceId,
    createdAt: date,
  };
};
export { generateSampleEnvironment };
