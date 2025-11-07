import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { notifications } from "@sparrow/library/ui";
import Papa from "papaparse";

/**
 * Downloads dataset as JSON or CSV file for desktop application using Tauri
 *
 * @param dataSetItem - Array of data objects to export
 * @param dataSetFormatType - Format type: 'JSON' or 'CSV'
 * @param fileName - Base name for the exported file (without extension)
 */
const handleTestDataDownloadDesktop = async (
  dataSetItem: Record<string, any>[],
  dataSetFormatType: "JSON" | "CSV",
  fileName: string,
): Promise<void> => {
  try {
    // Validate input parameters
    if (!dataSetItem || !Array.isArray(dataSetItem)) {
      notifications.error("Invalid dataset provided.");
      return;
    }

    if (!dataSetFormatType || !["JSON", "CSV"].includes(dataSetFormatType)) {
      notifications.error("Invalid format type. Must be JSON or CSV.");
      return;
    }

    let fileContent = "";
    let extension = "";

    // Convert data based on format type
    if (dataSetFormatType === "JSON") {
      // Pretty-print JSON with 2-space indentation
      fileContent = JSON.stringify(dataSetItem, null, 2);
      extension = "json";
    } else if (dataSetFormatType === "CSV") {
      // Use Papa Parse for robust CSV generation
      fileContent = convertToCsvWithPapaParse(dataSetItem);
      extension = "csv";
    }

    // Check if content was generated
    if (!fileContent) {
      notifications.error("No data available to export.");
      return;
    }

    // Open native file save dialog with appropriate filters
    const path = await save({
      defaultPath: `${fileName}`,
      filters: [
        {
          name: `${dataSetFormatType} Files`,
          extensions: [extension],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    // User canceled the save dialog
    if (!path) {
      console.info("File save operation canceled by user.");
      return;
    }

    // Write file to selected path
    await writeTextFile(path, fileContent, {
      baseDir: BaseDirectory.AppConfig,
    });

    notifications.success(`${dataSetFormatType} file exported successfully.`);
  } catch (error) {
    console.error("Error while exporting file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    notifications.error(`Failed to export file: ${errorMessage}`);
  }
};

/**
 * Downloads dataset as JSON or CSV file for web application
 *
 * @param dataSetItem - Array of data objects to export
 * @param dataSetFormatType - Format type: 'JSON' or 'CSV'
 * @param fileName - Base name for the exported file (without extension)
 */
const handleTestDataDownloadWeb = async (
  dataSetItem: Record<string, any>[],
  dataSetFormatType: "JSON" | "CSV",
  fileName: string,
): Promise<void> => {
  try {
    // Validate input parameters
    if (!dataSetItem || !Array.isArray(dataSetItem)) {
      notifications.error("Invalid dataset provided.");
      return;
    }

    if (!dataSetFormatType || !["JSON", "CSV"].includes(dataSetFormatType)) {
      notifications.error("Invalid format type. Must be JSON or CSV.");
      return;
    }

    let fileContent = "";
    let mimeType = "";
    let extension = "";

    // Convert data based on format type
    if (dataSetFormatType === "JSON") {
      // Pretty-print JSON with 2-space indentation
      fileContent = JSON.stringify(dataSetItem, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else if (dataSetFormatType === "CSV") {
      // Use Papa Parse for robust CSV generation
      fileContent = convertToCsvWithPapaParse(dataSetItem);
      mimeType = "text/csv;charset=utf-8;";
      extension = "csv";

      // Add UTF-8 BOM for Excel compatibility
      fileContent = "\uFEFF" + fileContent;
    }

    // Check if content was generated
    if (!fileContent) {
      notifications.error("No data available to export.");
      return;
    }

    // Create blob with proper encoding
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}`;
    link.style.display = "none";

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup: Remove link and revoke object URL after a short delay
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    notifications.success(`${dataSetFormatType} file downloaded successfully.`);
  } catch (error) {
    console.error("Error while exporting file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    notifications.error(`Failed to export file: ${errorMessage}`);
  }
};

/**
 * Converts an array of objects to CSV format using Papa Parse
 *
 * @param data - Array of objects to convert to CSV
 * @returns CSV string with properly formatted and escaped values
 *
 * @description
 * Uses Papa Parse library for robust CSV generation with:
 * - RFC 4180 compliant formatting
 * - Automatic quoting of fields containing special characters
 * - Proper escaping of quotes within fields
 * - Headers extracted from object keys
 * - Handles null/undefined/complex values gracefully
 * - Consistent field ordering across all rows
 *
 * Papa Parse Configuration:
 * - quotes: true - Always quote fields for consistency
 * - quoteChar: '"' - Use double quotes (RFC 4180 standard)
 * - escapeChar: '"' - Escape quotes by doubling them
 * - header: true - Include header row with column names
 * - newline: '\n' - Use Unix-style line endings
 * - skipEmptyLines: false - Preserve empty rows if present
 *
 * @example
 * const csv = convertToCsvWithPapaParse([
 *   { name: "John, Jr.", age: 30, metadata: { role: "admin" } },
 *   { name: "Jane \"Doe\"", age: 25, metadata: { role: "user" } }
 * ]);
 * // Returns:
 * // "name","age","metadata"
 * // "John, Jr.","30","{""role"":""admin""}"
 * // "Jane ""Doe""","25","{""role"":""user""}"
 */
const convertToCsvWithPapaParse = (data: Record<string, any>[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return "";
  }
  try {
    // Process data to handle complex types
    const processedData = data.map((row) => {
      const processedRow: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        // Handle null/undefined
        if (value === null || value === undefined) {
          processedRow[key] = "";
        }
        // Handle objects and arrays - convert to JSON string
        else if (typeof value === "object") {
          processedRow[key] = JSON.stringify(value);
        }
        // Handle all other types
        else {
          processedRow[key] = value;
        }
      }
      return processedRow;
    });

    // Use Papa Parse to generate CSV with optimal settings
    const csv = Papa.unparse(processedData, {
      quotes: true,
      quoteChar: '"',
      escapeChar: '"',
      header: true,
      newline: "\n",
      skipEmptyLines: false,
      delimiter: ",",
    });

    return csv;
  } catch (error) {
    console.error("Error converting data to CSV:", error);
    throw new Error("Failed to convert data to CSV format");
  }
};

// Export functions
export { handleTestDataDownloadDesktop, handleTestDataDownloadWeb };
