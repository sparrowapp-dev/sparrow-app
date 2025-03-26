import { Dropdown } from '@sparrow/library/ui';
import {  EditIcon, } from '@sparrow/library/icons';
import { SettingIcon } from '@sparrow/library/icons';
import { CleanerIcon } from '@sparrow/library/icons';

/**
 * Dropdown component provides a menu that appears when a button is clicked.
 */
export default {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {
    isBackgroundClickable: {
      control: 'boolean',
      description: 'Determines if clicking outside closes the dropdown'
    },
    isMenuOpen: {
      control: 'boolean',
      description: 'Controls the visibility of the dropdown menu'
    },
    disable: {
      control: 'boolean',
      description: 'Disables all dropdown options'
    },
    horizontalPosition: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Horizontal position of the dropdown relative to the trigger'
    },
    minWidth: {
      control: 'number',
      description: 'Minimum width of the dropdown menu in pixels'
    },
    zIndex: {
      control: 'number',
      description: 'Z-index of the dropdown menu'
    }
  }
};

// Sample options data for stories
const sampleOptions = [
  {
    name: 'Edit',
    icon: EditIcon,
    color: 'var(--text-ds-neutral-50)',
    iconColor: 'var(--text-ds-neutral-50)',
    iconSize: '16px',
    onclick: () => console.log('Edit clicked')
  },
  {
    name: 'Settings',
    icon: SettingIcon,
    color: 'var(--text-ds-neutral-50)',
    iconColor: 'var(--text-ds-neutral-50)',
    iconSize: '16px',
    onclick: () => console.log('Settings clicked')
  },
  {
    name: 'Delete',
    icon: CleanerIcon,
    color: 'var(--text-ds-neutral-50)',
    iconColor: 'var(--text-ds-neutral-50)',
    iconSize: '16px',
    onclick: () => console.log('Delete clicked')
  }
];

// Sample options with subtitles
const optionsWithSubtitles = [
  {
    name: 'Edit Document',
    subTitle: 'Make changes to the current document',
    icon: EditIcon,
    color: 'var(--text-ds-neutral-50)',
    iconColor: 'var(--text-ds-neutral-50)',
    iconSize: '16px',
    onclick: () => console.log('Edit clicked')
  },
  {
    name: 'Settings',
    subTitle: 'Configure application settings',
    icon: SettingIcon,
    color: 'var(--text-ds-neutral-50)',
    iconColor: 'var(--text-ds-neutral-50)',
    iconSize: '16px',
    onclick: () => console.log('Settings clicked')
  },
  {
    name: 'Delete',
    subTitle: 'Remove this item permanently',
    icon: CleanerIcon,
    color: 'var(--text-ds-danger-300)',
    iconColor: 'var(--text-ds-danger-300)',
    iconSize: '16px',
    onclick: () => console.log('Delete clicked')
  }
];

// Helper function to create the button slot
const createTemplate = (args) => ({
  Component: Dropdown,
  props: args,
  // This is how we add the button slot in Storybook
  // The actual implementation will use a slot in Svelte
  slot: '<button class="btn btn-primary">Click Me</button>'
});

// Base story
export const Default = {
  args: {
    buttonId: 'default-dropdown',
    isMenuOpen: true,
    options: sampleOptions,
    horizontalPosition: 'right',
    minWidth: 200,
    isBackgroundClickable: true,
    disable: false,
    zIndex: 9999
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic dropdown menu with default settings.'
      }
    }
  }
};

// export const WithSubtitles = {
//   args: {
//     ...Default.args,
//     buttonId: 'subtitle-dropdown',
//     options: optionsWithSubtitles
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'Dropdown with subtitle text for each option.'
//       }
//     }
//   }
// };

export const Disabled = {
  args: {
    ...Default.args,
    buttonId: 'disabled-dropdown',
    disable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with all options disabled.'
      }
    }
  }
};

export const WithoutIcons = {
  args: {
    ...Default.args,
    buttonId: 'no-icons-dropdown',
    options: sampleOptions.map(option => ({
      ...option,
      icon: undefined
    }))
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown menu with text-only options (no icons).'
      }
    }
  }
};
