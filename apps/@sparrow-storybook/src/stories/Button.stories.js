// import Button from './Button.svelte'; // Uncomment if you're using a local component
import { Button } from '@sparrow/library/ui';  // Adjust import based on your package structure

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', defaultValue: 'Submit' },
    onClick: { action: 'clicked' },
    loader: { control: 'boolean' },
    loaderSize: { control: 'number' },
    disable: { control: 'boolean' },
    buttonStyleProp: { control: 'text' },
    buttonClassProp: { control: 'text' },
    textClassProp: { control: 'text' },
    textStyleProp: { control: 'text' },
    buttonStartIcon: { control: 'text' },
    buttonStartIconStyle: { control: 'text' },
    allowChild: { control: 'boolean' },
    type: { control: 'select', options: ['primary', 'dark', 'danger', 'violet', 'transparent', 'teritiary', 'other', 'icon'] },
    id: { control: 'text' },
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    title: 'Submit',
    type: 'primary',
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Red = {
  args: {
    title: 'Submit',
    textStyleProp: 'background-color:red;',
  },
};

export const Dark = {
  args: {
    title: 'Submit',
    type: 'dark',
  },
};

export const Danger = {
  args: {
    title: 'Delete',
    type: 'danger',
  },
};

export const Transparent = {
  args: {
    title: 'Cancel',
    type: 'transparent',
  },
};

export const WithLoader = {
  args: {
    title: 'Loading...',
    loader: true,
    loaderSize: 20,
    type: 'other',
  },
};

export const WithIcon = {
  args: {
    title: 'Submit',
    type: 'icon',
    buttonStartIcon: 'path/to/icon.svg', // Replace with a valid icon URL or path
  },
};

export const WithCustomChild = {
  args: {
    allowChild: true,
  },
  // Use the `slots` property to insert content inside the button's slot
  // This will make the button render with custom child content
  slots: {
    default: '<span>Custom Child Content</span>',
  },
};
