export const ICON_CONFIG = {
  TITLE: `Upload Logo`,
  DESCRIPTION: `Upload your image (max 2 MB, square format). Supported: .jpg, .jpeg, .png.`,
  FILE_TYPES: [".jpg", ".jpeg", ".png"],
  MAX_FILE_SIZE_KB: 2048,
  MAX_WIDTH_PX: 4096,
  MAX_HEIGHT_PX: 4096,
  SIZE_EXCEED_ERROR_MESSAGE: `The size of the file you are trying to upload is more than 2 MB.`,
  WRONG_FILE_ERROR_MESSAGE: `The format of the file you are trying to upload is not supported.`,
  PLACEHOLDER: `Drag and Drop or`,
  DIMENSION_EXCEED_ERROR_MESSAGE:
    "The dimension of the file you are trying to upload is more than 4096 × 4096.",
};
