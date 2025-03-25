import { Tooltip } from '@sparrow/library/ui';

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The main tooltip text',
      table: {
        defaultValue: { summary: 'Tooltip' },
      },
    },
    subtext: {
      control: 'text',
      description: 'Additional text shown below the title (only for medium size)',
      table: {
        defaultValue: { summary: '' },
      },
    },
    placement: {
      control: { type: 'select' },
      options: [
        'left-center',
        'right-center',
        'top-center',
        'bottom-center',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'left-top',
        'left-bottom',
        'right-top',
        'right-bottom'
      ],
      description: 'The placement of the tooltip relative to the trigger element',
      table: {
        defaultValue: { summary: 'bottom-center' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium'],
      description: 'The size of the tooltip',
      table: {
        defaultValue: { summary: 'small' },
      },
    },
    show: {
      control: 'boolean',
      description: 'Whether the tooltip is visible',
      table: {
        defaultValue: { summary: true },
      },
    },
    distance: {
      control: { type: 'number' },
      description: 'Distance from the trigger element in pixels',
      table: {
        defaultValue: { summary: 10 },
      },
    },
    delay: {
      control: { type: 'number' },
      description: 'Delay before showing the tooltip in milliseconds',
      table: {
        defaultValue: { summary: 50 },
      },
    },
    zIndex: {
      control: { type: 'number' },
      description: 'Z-index of the tooltip',
      table: {
        defaultValue: { summary: 1 },
      },
    },
    transitionTime: {
      control: 'text',
      description: 'Duration of the tooltip animation',
      table: {
        defaultValue: { summary: '0.3s' },
      },
    },
    spacing: {
      control: 'text',
      description: 'Internal padding of the tooltip',
      table: {
        defaultValue: { summary: '4px 10px' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A tooltip component that provides additional information when hovering over an element.',
      },
    },
  },
};

// Basic tooltip example
export const Basic = {
  args: {
    title: 'Tooltip',
    placement: 'bottom-center',
    size: 'small',
  },
};

// Medium tooltip with subtext
export const MediumWithSubtext = {
  args: {
    title: 'Tooltip Title',
    subtext: 'This is additional information that appears below the title',
    placement: 'bottom-center',
    size: 'medium',
  },
};

// Top placement example
export const TopPlacement = {
  args: {
    title: 'Top Tooltip',
    placement: 'top-center',
    size: 'small',
  },
};

// Left placement example
export const LeftPlacement = {
  args: {
    title: 'Left Tooltip',
    placement: 'left-center',
    size: 'small',
  },
};

// Right placement example
export const RightPlacement = {
  args: {
    title: 'Right Tooltip',
    placement: 'right-center',
    size: 'small',
  },
};

// Bottom placement example
export const BottomPlacement = {
  args: {
    title: 'Bottom Tooltip',
    placement: 'bottom-center',
    size: 'small',
  },
};

// Custom styling
export const CustomStyling = {
  args: {
    title: 'Custom Tooltip',
    styleProp: 'background-color: #4a154b; color: white;',
    placement: 'top-center',
  },
};

// HTML content
export const HTMLContent = {
  args: {
    title: '<strong>Bold text</strong> and <em>italic text</em>',
    subtext: 'Tooltip with <span style="color: red;">HTML content</span>',
    size: 'medium',
  },
};