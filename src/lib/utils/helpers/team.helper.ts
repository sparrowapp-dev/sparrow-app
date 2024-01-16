/* eslint-disable @typescript-eslint/no-explicit-any */

const imageDataToURL = (data: any) => {
  if (!data) return undefined;
  const imageBuffer = Buffer.from(data);
  if (!imageBuffer) return undefined;
  const blob = new Blob([data], { type: data.mimetype });
  return URL.createObjectURL(blob);
};

export { imageDataToURL };
