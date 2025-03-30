import { Avatar } from "@sparrow/library/ui";
import { logoIcon } from "@sparrow/library/assets";
export default {
    title: 'Components/Avatar',
    component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['person', 'letter', 'image'],
      description: 'Avatar style to display'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the avatar'
    },
    letter: {
      control: 'text',
      description: 'Letter to display (for letter type)'
    },
    image: {
      control: 'text',
      description: 'Image URL (for image type)'
    },
    bgColor: {
      control: 'color',
      description: 'Background color for letter type avatar'
    }
  }
};

// Common props that will be used across all stories
const commonProps = {
  size: 'medium',
};

// Person Avatar
export const Person = {
  args: {
    ...commonProps,
    type: 'person'
  }
};

// Letter Avatar
export const Letter = {
  args: {
    ...commonProps,
    type: 'letter',
    letter: 'A',
    bgColor: 'var(--bg-tertiary-800)'
  }
};

// Image Avatar
export const Image = {
  args: {
    ...commonProps,
    type: 'image',
    image: logoIcon
  }
};




