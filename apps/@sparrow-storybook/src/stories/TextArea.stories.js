// TextArea.stories.js
import { Textarea }from '@sparrow/library/forms';

export default {
  title: 'Components/TextArea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    placeholderColor: { control: 'color' },
    height: { control: 'text' },
    width: { control: 'text' },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
    defaultBorderColor: { control: 'color' },
    hoveredBorderColor: { control: 'color' },
    focusedBorderColor: { control: 'color' },
    maxlength: { control: 'number' },
    id: { control: 'text' },
    class: { control: 'text' },
    style: { control: 'text' },
    blur: { action: 'blur' },
    input: { action: 'input' }
  },
  parameters: {
    docs: {
      description: {
        component: 'A customizable textarea component with hover and focus states, placeholder styling, and event dispatching.'
      }
    }
  }
};

// Default view of the textarea
export const Default = {
  render: (args) => ({
    Component: Textarea,
    props: args,
    on: {
      blur: args.blur,
      input: args.input
    }
  }),
  args: {
    placeholder: 'Enter your text here...',
    placeholderColor: 'gray',
    height: '100px',
    width: '300px',
    value: '',
    disabled: false,
    maxlength: 500,
    id: 'textarea-default',
    defaultBorderColor: 'transparent',
    hoveredBorderColor: '#ff5555',
    focusedBorderColor: '#55aa55'
  }
};

// Disabled state
export const Disabled = {
  render: (args) => ({
    Component: Textarea,
    props: args
  }),
  args: {
    ...Default.args,
    disabled: true,
    id: 'textarea-disabled',
    value: 'This textarea is disabled and cannot be edited.',
    placeholder: 'Disabled textarea'
  }
};

// With pre-filled content
export const WithContent = {
  render: (args) => ({
    Component: Textarea,
    props: args
  }),
  args: {
    ...Default.args,
    id: 'textarea-with-content',
    value: 'This textarea contains some pre-filled content that can be edited by the user.',
    height: '150px'
  }
};

// Custom styling
export const CustomStyling = {
  render: (args) => ({
    Component: Textarea,
    props: args
  }),
  args: {
    ...Default.args,
    id: 'textarea-custom',
    placeholder: 'Custom styled textarea',
    defaultBorderColor: '#dddddd',
    hoveredBorderColor: '#ff9900',
    focusedBorderColor: '#009900',
    placeholderColor: '#aaaaaa',
    class: 'custom-textarea',
    style: 'background-color: #f5f5f5; border-radius: 8px; padding: 12px; font-family: Arial;'
  }
};

// Dark theme without decorators
export const DarkTheme = {
  render: (args) => ({
    Component: Textarea,
    props: args
  }),
  args: {
    ...Default.args,
    id: 'textarea-dark',
    class: 'dark-textarea',
    style: 'background-color: #2a2a2a; color: white; padding: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.5);',
    defaultBorderColor: '#444444',
    hoveredBorderColor: '#ff5555',
    focusedBorderColor: '#55aa55',
    placeholderColor: '#888888',
    placeholder: 'Dark theme textarea'
  }
};

// Error state
export const ErrorState = {
  render: (args) => ({
    Component: Textarea,
    props: args
  }),
  args: {
    ...Default.args,
    id: 'textarea-error',
    defaultBorderColor: '#ff5555',
    hoveredBorderColor: '#ff5555',
    focusedBorderColor: '#ff5555',
    placeholder: 'This textarea shows an error state',
    style: 'background-color: rgba(255, 0, 0, 0.05);'
  }
};