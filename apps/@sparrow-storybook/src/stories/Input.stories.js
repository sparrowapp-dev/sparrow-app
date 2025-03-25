import { Input } from "@sparrow/library/forms";

export default {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'stroke', 'inline'],
      description: 'The visual style of the input'
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'password'],
      description: 'HTML input type'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Controls the size of the input'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text displayed when input is empty'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled'
    },
    isError: {
      control: 'boolean',
      description: 'Whether the input should display an error state'
    },
    width: {
      control: 'text',
      description: 'Width of the input (CSS value)'
    },
    value: {
      control: 'text',
      description: 'Current input value'
    },
    maxlength: {
      control: { type: 'number' },
      description: 'Maximum number of characters allowed'
    },
    id: {
      control: 'text',
      description: 'HTML ID attribute for the input'
    }
  }
};

const Template = (args) => ({
  Component: Input,
  props: args,
  on: {
    input: (e) => console.log('Input event:', e.detail),
    blur: (e) => console.log('Blur event:', e.detail)
  }
});

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  size: 'medium',
  placeholder: 'Enter text here',
  type: 'text',
  disabled: false,
  isError: false,
  width: '300px',
  value: '',
  maxlength: 500,
  id: 'primary-input'
};

export const Stroke = Template.bind({});
Stroke.args = {
  ...Primary.args,
  variant: 'stroke',
  id: 'stroke-input'
};

export const Inline = Template.bind({});
Inline.args = {
  ...Primary.args,
  variant: 'inline',
  id: 'inline-input'
};
