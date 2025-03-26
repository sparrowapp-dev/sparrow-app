import { Loader } from '@sparrow/library/ui';

/**
 * The Loader component displays a spinner with an optional message.
 * It can be used to indicate loading states in your application.
 */
export default {
  title: 'Components/Loader', 
  component: Loader,
  tags: ['autodocs'],
  argTypes: {
    loaderMessage: {
      control: 'text',
      description: 'Message to display below the spinner',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    messageClassProp: {
      control: 'text',
      description: 'CSS class to apply to the message',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    messageStyleProp: {
      control: 'text',
      description: 'Inline styles to apply to the message',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    loaderContainerClassProp: {
      control: 'text',
      description: 'CSS class to apply to the loader container',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    loaderContainerStyleProp: {
      control: 'text',
      description: 'Inline styles to apply to the loader container',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    loaderSize: {
      control: 'text',
      description: 'Size of the spinner',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
  },
};

export const Default = {
  args: {
    loaderMessage: '',
    loaderSize: '',
  },
};

export const WithMessage = {
  args: {
    loaderMessage: 'Loading...',
    loaderSize: '',
  },
};


