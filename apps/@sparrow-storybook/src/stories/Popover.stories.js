// Popover.stories.js
import {Popover} from '@sparrow/library/ui';

export default {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    heading: { 
      control: 'text', 
      defaultValue: 'Default Heading' 
    },
    onClose: { 
      action: 'clicked' 
    }
  }
};

// Template for the popup story
const Template = (args) => ({
  Component: Popover,
  props: args,
  on: {
    click: args.onClose
  }
});

// Basic Popover Story
export const Basic = Template.bind({});
Basic.args = {
  heading: 'Information Popover',
  children: 'This is a basic popup with some content.'
};

