export const ICON_CONFIG = {
  DESCRIPTION: `Drag and drop your image. We recommend that you upload an image with square 
  aspect ratio.The image size should not be more than 2 MB.
   Supported formats are .jpg, .jpeg, .png`,
  FILE_TYPES: [".jpg", ".jpeg", ".png"],
  MAX_FILE_SIZE_KB: 2048,
  SIZE_EXCEED_ERROR_MESSAGE: `The size of the file you are trying to upload is more than 2 MB.`,
  WRONG_FILE_ERROR_MESSAGE: `This file type is not supported. Please reupload in any of the above
        file formats.
        `,
};

export const NAME_CONFIG = {
  TITLE: `Team Name`,
  MAX_TEXT_SIZE: 500,
  PLACEHOLDER: `Team or Organization name`,
};

export const DESCRIPTION_CONFIG = {
  TITLE: `About`,
  MAX_TEXT_SIZE: 500,
  PLACEHOLDER: `Add teams's description`,
};

export const OWNER_CONFIG = {
  TITLE: `Owner`,
};
