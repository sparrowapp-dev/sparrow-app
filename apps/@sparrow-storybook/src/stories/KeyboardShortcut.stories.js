import { KeyboardShortcuts } from "@sparrow/library/ui";

// Meta information about the component
const meta = {
  title: 'Components/Keyboard Shortcuts',
  component: KeyboardShortcuts,
  tags: ['autodocs'],
  argTypes: {
    keys: {
      control: 'array',
      description: 'Array of key names to display. Use "cmd" for the command key icon.',
    },
  },
};

export default meta;

// Basic usage with simple keys
export const Basic = {
  args: {
    keys: ['Ctrl', 'Shift', 'F'],
  },
};

// With command key icon
export const WithCommandKey = {
  args: {
    keys: ['cmd', 'F'],
  },
};

