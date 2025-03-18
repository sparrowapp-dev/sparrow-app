import { Badge } from "@sparrow/library/ui";

export default {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select', options: ['danger', 'primary', 'neutral'] },
      description: 'Determines the color scheme of the badge',
      defaultValue: 'danger',
    },
    size: {
      control: { type: 'radio', options: ['small', 'medium'] },
      description: 'Controls the size of the badge',
      defaultValue: 'medium',
    },
    type: {
      control: { type: 'radio', options: ['dot', 'count'] },
      description: 'Display type - either a dot or a number',
      defaultValue: 'count',
    },
    count: {
      control: { type: 'number' },
      description: 'Numeric value to display (only used when type is "count")',
      defaultValue: 1,
    },
  },
};

// Base template for creating stories
const Template = (args) => ({
  Component: Badge,
  props: args,
});

// Danger variant stories
export const DangerCount = Template.bind({});
DangerCount.args = {
  variant: 'danger',
  type: 'count',
  count: 5,
  size: 'medium',
};
DangerCount.storyName = 'Danger';
DangerCount.parameters = {
  docs: {
    description: {
      story: 'Displays a red badge with a number, used for critical notifications or alerts.',
    },
  },
};



// Primary variant stories
export const PrimaryCount = Template.bind({});
PrimaryCount.args = {
  variant: 'primary',
  type: 'count',
  count: 3,
  size: 'medium',
};
PrimaryCount.storyName = 'Primary';
PrimaryCount.parameters = {
  docs: {
    description: {
      story: 'Blue badge with a number, used for informational notifications.',
    },
  },
};


// Neutral variant stories
export const NeutralCount = Template.bind({});
NeutralCount.args = {
  variant: 'neutral',
  type: 'count',
  count: 4,
  size: 'medium',
};
NeutralCount.storyName = 'Neutral';
NeutralCount.parameters = {
  docs: {
    description: {
      story: 'Gray badge with a number, used for general status information.',
    },
  },
};

