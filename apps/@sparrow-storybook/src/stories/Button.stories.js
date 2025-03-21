import { Button } from '@sparrow/library/ui';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: [
        'primary',
        'secondary',
        'dark',
        'danger',
        'teritiary-regular',
        'teritiary-danger',
        'underline',
        'outline-primary',
        'outline-secondary',
        'outline-danger',
        'link-primary',
        'link-secondary'
      ]
    },
    size: {
      control: { type: 'select' },
      options: ['extra-small', 'small', 'medium', 'large']
    },
    disable: { control: 'boolean' },
    loader: { control: 'boolean' },
    customWidth: { control: 'text' },
     startIcon: { 
      control: 'boolean',
      description: 'Show start icon (uses plusWhiteIcon)'
    },
    endIcon: { 
      control: 'boolean',
      description: 'Show end icon (uses plusWhiteIcon)'
    }
     
  }
};

// Common props that will be used across all stories
const commonProps = {
  title: 'Button',
  size: 'medium',
  disable: false,
  loader: false,
  onClick: action('clicked')
};

// Stories for each button type
export const Primary = {
  args: {
    ...commonProps,
    type: 'primary'
  }
};

export const Secondary = {
  args: {
    ...commonProps,
    type: 'secondary'
  }
};


export const Danger = {
  args: {
    ...commonProps,
    type: 'danger'
  }
};


export const TeritiaryRegular = {
  args: {
    ...commonProps,
    type: 'teritiary-regular'
  }
};

export const TeritiaryDanger = {
  args: {
    ...commonProps,
    type: 'teritiary-danger'
  }
};


export const OutlinePrimary = {
  args: {
    ...commonProps,
    type: 'outline-primary'
  }
};

export const OutlineSecondary = {
  args: {
    ...commonProps,
    type: 'outline-secondary'
  }
};

export const OutlineDanger = {
  args: {
    ...commonProps,
    type: 'outline-danger'
  }
};

export const LinkPrimary = {
  args: {
    ...commonProps,
    type: 'link-primary'
  }
};

export const LinkSecondary = {
  args: {
    ...commonProps,
    type: 'link-secondary'
  }
};