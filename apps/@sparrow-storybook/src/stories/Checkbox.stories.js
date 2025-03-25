import {Checkbox} from '@sparrow/library/forms';

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled'
    },
    type: {
      control: { type: 'select' },
      options: ['button', 'button-checkbox-text'],
      description: 'The visual style of the checkbox'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'large'],
      description: 'Controls the size of the checkbox'
    },
    text: {
      control: 'text',
      description: 'Text label shown when type is button-checkbox-text'
    }
  }
};

const Template = (args) => ({
  Component: Checkbox,
  props: args,
  on: {
    input: (e) => console.log('Input event:', e.detail)
  }
});

export const Default = Template.bind({});
Default.args = {
  checked: false,
  disabled: false,
  type: 'button',
  size: 'small',
  text: ''
};

export const Checked = Template.bind({});
Checked.args = {
  ...Default.args,
  checked: true
};

export const WithText = Template.bind({});
WithText.args = {
  ...Default.args,
  type: 'button-checkbox-text',
  text: 'Checkbox label'
};

export const CheckedWithText = Template.bind({});
CheckedWithText.args = {
  ...WithText.args,
  checked: true
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  disabled: true
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  ...Default.args,
  checked: true,
  disabled: true
};
