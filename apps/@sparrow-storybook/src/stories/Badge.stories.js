import { Badge } from "@sparrow/library/ui";

export default {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['danger', 'primary', 'neutral'],
      description: 'Color variant of the badge'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium'],
      description: 'Size of the badge'
    },
    type: {
      control: { type: 'select' },
      options: ['dot', 'count'],
      description: 'Type of badge display'
    },
    count: {
      control: { type: 'number' },
      description: 'Number to display in count type'
    }
  }
};

export const PrimaryCountDefault = {
  args: {
    variant: 'primary',
    type: 'count',
    count: 5
  }
};

export const PrimaryCountLarge = {
  args: {
    variant: 'primary',
    type: 'count',
    count: 999
  }
};

export const DangerCountDefault = {
  args: {
    variant: 'danger',
    type: 'count',
    count: 3
  }
};

export const DangerCountOverflow = {
  args: {
    variant: 'danger',
    type: 'count',
    count: 1500
  }
};

export const NeutralCountDefault = {
  args: {
    variant: 'neutral',
    type: 'count',
    count: 7
  }
};

export const NeutralDotMedium = {
  args: {
    variant: 'neutral',
    type: 'dot',
    size: 'medium'
  }
};