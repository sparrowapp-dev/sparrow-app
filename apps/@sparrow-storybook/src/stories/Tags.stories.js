import {Tag} from '@sparrow/library/ui';

export default {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['cyan', 'purple', 'yellow', 'green', 'orange', 'grey', 'pink'],
      description: 'The color variant of the tag',
      table: {
        defaultValue: { summary: 'grey' },
      },
    },
    text: {
      control: 'text',
      description: 'The text content of the tag',
      table: {
        defaultValue: { summary: 'Tag' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A tag component for categorizing or marking content with different color variants.',
      },
    },
  },
};

// Basic tag example
export const Basic = {
  args: {
    text: 'Tag',
    type: 'grey',
  },
};


// Long text example
export const LongText = {
  args: {
    text: 'This is a very long tag text that will be truncated',
    type: 'cyan',
  },
};



// Seven words example (will be truncated)
export const Morethan5Words = {
  args: {
    text: 'This has more than five words and will truncate',
    type: 'pink',
  },
};