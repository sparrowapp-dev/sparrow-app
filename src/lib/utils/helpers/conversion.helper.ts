const createDeepCopy = (data) => {
  return JSON.parse(JSON.stringify(data));
};

export { createDeepCopy };
