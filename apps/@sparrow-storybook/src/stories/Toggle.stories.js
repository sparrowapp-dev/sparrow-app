import { Toggle } from '@sparrow/library/ui';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    isActive: { 
      control: 'boolean',
      description: 'The state of the toggle switch'
    },
    disabled: { 
      control: 'boolean',
      description: 'Whether the toggle is disabled'
    },
    label: { 
      control: 'text',
      description: 'Label text for the toggle'
    },
    textColor: { 
      control: 'color',
      description: 'Color for the label text'
    },
    fontSize: { 
      control: 'text',
      description: 'Font size of the label'
    },
    fontWeight: { 
      control: 'text',
      description: 'Font weight of the label'
    },
    onChange: { action: 'changed' },
    onClick: { action: 'clicked' }
  }
};

// Common props that will be used across all stories
const commonProps = {
  isActive: false,
  disabled: false,
  label: '',
  textColor: 'var(--text-ds-primary-400)',
  fontSize: '12px',
  fontWeight: '900',
  onChange: action('changed'),
  onClick: action('clicked')
};

// Basic toggle
export const Default = {
  args: {
    ...commonProps
  }
};

// // Active toggle
// export const Active = {
//   args: {
//     ...commonProps,
//     isActive: true
//   }
// };

// // Disabled toggle
// export const Disabled = {
//   args: {
//     ...commonProps,
//     disabled: true
//   }
// };

// // Disabled and Active toggle
// export const DisabledActive = {
//   args: {
//     ...commonProps,
//     isActive: true,
//     disabled: true
//   }
// };

// // Toggle without label
// export const NoLabel = {
//   args: {
//     ...commonProps,
//     label: ''
//   }
// };

// // Toggle with long label that gets truncated
// export const LongLabel = {
//   args: {
//     ...commonProps,
//     label: 'This is a very long label that will be truncated automatically'
//   }
// };

// // Toggle with custom styling
// export const CustomStyling = {
//   args: {
//     ...commonProps,
//     textColor: 'var(--text-ds-danger-300)',
//     fontSize: '14px',
//     fontWeight: '500'
//   }
// };