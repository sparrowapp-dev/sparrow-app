import { Progress } from '@sparrow/library/ui';

/**
 * The Progress component displays a progress overlay with a customizable title and animated progress bar.
 * It provides visual feedback to users during loading or processing operations.
 */
export default {
  title: 'Components/Progress',
  component: Progress,
//   tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    isProgress: { control: 'boolean' },
    zIndex: { 
      control: { type: 'select' }, 
      options: [1, 100, 1000, 10000, 100000],
      description: 'Z-index value for the overlay. Recommended values: 1, 100, 1000, 10000, 100000'
    },
    onClick: { action: 'clicked' },
  },
};

// Default Progress
export const Default = {
  args: {
    title: 'Loading...',
    isProgress: true,
    zIndex: 1000,
  },
};
