export const ICON_CONFIG = {
  DESCRIPTION: `Upload or drag and drop your image. For best results, use a square image under 2 MB in size. Supported formats: .jpg, .jpeg, .png.`,
  FILE_TYPES: [".jpg", ".jpeg", ".png"],
  MAX_FILE_SIZE_KB: 2048,
  MAX_WIDTH_PX: 4096,
  MAX_HEIGHT_PX: 4096,
  SIZE_EXCEED_ERROR_MESSAGE: `The size of the file you are trying to upload is more than 2 MB.`,
  WRONG_FILE_ERROR_MESSAGE: `This file type is not supported. Please reupload in any of the following
      file formats.
        `,
  DIMENSION_EXCEED_ERROR_MESSAGE:
    "The dimension of the file you are trying to upload is more than 4096 × 4096.",
};

export const NAME_CONFIG = {
  TITLE: `Hub Name`,
  MAX_TEXT_SIZE: 100,
  PLACEHOLDER: `Enter your hub name`,
};

export const DESCRIPTION_CONFIG = {
  TITLE: `Hub Summary`,
  MAX_TEXT_SIZE: 100,
  PLACEHOLDER: `Write a short summary about your hub`,
};

export const OWNER_CONFIG = {
  TITLE: `Owner`,
};
