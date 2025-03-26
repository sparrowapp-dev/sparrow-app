import { Alert } from '@sparrow/library/ui';

export default {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    varient: {
      control: { type: 'select' },
      options: ['error', 'success', 'warning', 'info'],
      description: 'Defines the visual style and icon of the alert',
      defaultValue: 'error'
    },
    heading: {
      control: 'text',
      description: 'Optional heading displayed above the description'
    },
    description: {
      control: 'text',
      description: 'Main message of the alert'
    },
    ctaShow: {
      control: 'boolean',
      description: 'Whether to show the call-to-action button',
      defaultValue: false
    },
    ctaTitle: {
      control: 'text',
      description: 'Text for the call-to-action button',
      defaultValue: 'Try Again'
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when the CTA button is clicked'
    }
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible alert component used to display informational messages to users with various severity levels.'
      }
    }
  }
};

export const Error = {
  args: {
    varient: 'error',
    description: 'Could not send request. Please try again.',
    heading: 'Error',
    ctaShow: true,
    ctaTitle: 'Call to action'
  }
};

export const Success = {
  args: {
    varient: 'success',
    description: 'Request was sent successfully.',
    heading: 'Success',
    ctaShow: true,
    ctaTitle: 'Call to action'
  }
};

export const Warning = {
  args: {
    varient: 'warning',
    description: 'This action might cause unexpected results.',
    heading: 'Warning',
    ctaShow: true,
    ctaTitle: 'Call to action'
  }
};

export const Info = {
  args: {
    varient: 'info',
    description: 'New features are available in this version.',
    heading: 'Information',
    ctaShow: true,
    ctaTitle: 'Call to action'
  }
};