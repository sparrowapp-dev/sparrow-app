import { RadioButton } from "@sparrow/library/ui";

export default {
  title: 'Components/Radio',
  component: RadioButton,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
    id: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    group: { control: 'text' },
    labelText: { control: 'text' },
    buttonSize: { 
      control: { type: 'select' }, 
      options: ['small', 'medium'] 
    },
    disabled: { control: 'boolean' },
    singleSelect: { control: 'boolean' },
    variant: { 
      control: { type: 'select' }, 
      options: ['primary'] 
    }
  }
};

export const Default = {
  args: {
    id: 'radio-1',
    name: 'radio-group',
    value: true,
    group: 'option1',
    labelText: '',
    buttonSize: 'medium',
    disabled: false,
    singleSelect: true,
    variant: 'primary'
  }
};

export const WithLabel = {
  args: {
    id: 'radio-2',
    name: 'radio-group',
    value: 'option1',
    group: 'option1',
    labelText: 'Radio with label',
    buttonSize: 'medium',
    disabled: false,
    singleSelect: false,
    variant: 'primary'
  }
};

export const Small = {
  args: {
    id: 'radio-3',
    name: 'radio-group',
    value: 'option1',
    group: 'option1',
    labelText: 'Small radio',
    buttonSize: 'small',
    disabled: false,
    singleSelect: false,
    variant: 'primary'
  }
};

export const Disabled = {
  args: {
    id: 'radio-4',
    name: 'radio-group',
    value: 'option1',
    group: 'option1',
    labelText: 'Disabled radio',
    buttonSize: 'medium',
    disabled: true,
    singleSelect: false,
    variant: 'primary'
  }
};