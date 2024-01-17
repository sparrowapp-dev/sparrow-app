/* eslint-disable @typescript-eslint/no-explicit-any */

const imageDataToURL = (data: any) => {
  if (!data) return undefined;

  const blob = new Blob([data], { type: data.mimetype });
  return URL.createObjectURL(blob);
};

const base64ToURL = (base64str) => {
  if (!base64str || !base64str?.mimetype || !base64str?.bufferString) return "";
  return `data:${base64str?.mimetype};base64,${base64str?.bufferString}`;
};

export { imageDataToURL, base64ToURL };
