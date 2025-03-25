import { DragDrop } from '@sparrow/library/ui';

/**
 * DragDrop component allows users to upload files by drag and drop or through a file dialog.
 * It supports various file types, file size validation, and provides visual feedback.
 */
export default {
  title: 'Components/DragDrop',
  component: DragDrop,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A customizable file input component that supports image preview and file uploads.'
      },
    },
  },
};

export const Default = {
  args: {
    labelText: 'Upload File',
    labelDescription: 'Upload your file (max 100KB)',
    inputId: 'default-file-input',
    inputPlaceholder: 'Choose a file',
    maxFileSize: 102400, // 100KB
    isRequired: false,
    supportedFileTypes: ['.json', '.yaml', '.yml'],
    type: 'file',
    width: '100%',
    height: 'auto',
    iconHeight: 12,
    iconWidth: 12,
    value: [],
    onChange: (e, maxFileSize, supportedFileTypes) => {
      console.log('File changed:', e);
    },
    resetValue: () => {
      console.log('Reset value');
    },
    editValue: () => {
      console.log('Edit value');
    },
    showFileTypeError: false,
    showFileSizeError: false,
  }
};

export const Required = {
  args: {
    ...Default.args,
    labelText: 'Required File Upload',
    isRequired: true,
    inputId: 'required-file-input',
  }
};

export const ImageUpload = {
  args: {
    ...Default.args,
    labelText: 'Upload Image',
    labelDescription: 'Upload your image (max 100KB)',
    inputId: 'image-upload',
    supportedFileTypes: ['.jpg', '.jpeg', '.png', '.gif'],
    type: 'image',
  }
};

export const CompactUpload = {
  args: {
    ...Default.args,
    labelText: 'Compact File Upload',
    labelDescription: 'Upload files in a compact layout',
    inputId: 'compact-upload',
    width: '200px',
  }
};

export const WithErrors = {
  args: {
    ...Default.args,
    labelText: 'Upload with Errors',
    inputId: 'error-upload',
    showFileTypeError: true,
    fileTypeError: 'Please upload a valid JSON or YAML file.',
  }
};

export const FileSizeError = {
  args: {
    ...Default.args,
    labelText: 'File Size Error Example',
    inputId: 'size-error-upload',
    showFileSizeError: true,
    fileSizeError: 'The file exceeds the maximum allowed size of 100KB.',
  }
};