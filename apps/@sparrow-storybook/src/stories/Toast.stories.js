import { Toast } from '@sparrow/library/ui';

export default {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning'],
      description: 'Type of toast notification',
      defaultValue: 'success',
    },
    title: {
      control: 'text',
      description: 'Title of the toast notification (optional)',
    },
    description: {
      control: 'text',
      description: 'Content of the toast notification',
      defaultValue: 'This is a toast notification',
    },
    duration: {
      control: 'number',
      description: 'Duration in ms before the toast auto-closes (0 for no auto-close)',
      defaultValue: 0,
    },
  },
};

export const Success = {
  args: {
    type: 'success',
    description: 'Operation completed successfully!',
    duration: 0,
  },
};

export const Error = {
  args: {
    type: 'error',
    title: 'Error',
    description: 'Something went wrong. Please try again.',
    duration: 0,
  },
};

export const Warning = {
  args: {
    type: 'warning',
    title: 'Warning',
    description: 'This action cannot be undone.',
    duration: 0,
  },
};

export const Persistent = {
  args: {
    type: 'success',
    title: 'Persistent Toast',
    description: 'This toast will stay until manually closed.',
    duration: 0,
  },
};