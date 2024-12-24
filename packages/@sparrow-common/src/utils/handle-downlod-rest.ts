import { notifications } from "@sparrow/library/ui";

/**
 * @description - Initiates a file download by creating a Blob and triggering a download action.
 * @param _data - The data to be included in the file.
 * @param _contentType - The MIME type of the file content (e.g. "text/plain").
 * @param _fileNameWithExtention - The _fileNameWithExtension  used for set file name with extension to downloaded file (e.g "api_response_200 OK_898ms_22.9169921875kb.html").
 *
 * @returns - A Promise that resolves with "Success" when the file download is complete and Reject with "Failed" when there is error while downloading file.
 */

const handleDownloadResponse = async (
  _data: string,
  _contentType: string,
  _fileNameWithExtention: string,
): Promise<string> => {
  try {
    const blob: Blob = new Blob([_data], {
      type: _contentType || "plain/text",
    });

    const url: string = URL.createObjectURL(blob);

    const a: HTMLAnchorElement = document.createElement("a");
    a.href = url;

    a.download = _fileNameWithExtention;

    document.body.appendChild(a);

    // Start download asynchronously
    await Promise.resolve(a.click());

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    notifications.success("Exported successfully.");

    return "success";
  } catch (error) {
    notifications.error("Failed to export file.");

    return "failed";
  }
};

export { handleDownloadResponse };
