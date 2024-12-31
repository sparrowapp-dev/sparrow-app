export class Base64Converter {
  /**
   * Converts a File object to a Base64 string.
   * @param file - The File object to convert.
   * @returns A Promise that resolves to the Base64 string.
   */
  public fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Failed to convert file to Base64"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsDataURL(file);
    });
  }

 /**
   * Converts a Base64 string back to a File object.
   * Extracts the MIME type automatically from the string.
   * @param base64 - The Base64 string.
   * @param fileName - The name for the new file.
   * @returns A File object.
   */
 public base64ToFile(base64: string, fileName: string): File {
  const [metadata, data] = base64.split(',');
  const mimeType = metadata.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
  const byteString = atob(data);
  const byteNumbers = new Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    byteNumbers[i] = byteString.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return new File([blob], fileName, { type: mimeType });
}
}
