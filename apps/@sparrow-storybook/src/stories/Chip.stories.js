import { action } from '@storybook/addon-actions';
import {Chip}from "@sparrow/library/ui"

import { BoxIcon, CrossIcon2 } from '@sparrow/library/icons';


export default {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    startIcon: {
      control: { type: 'select' },
      options: ['BoxIcon', 'None'],
      mapping: {
        BoxIcon: BoxIcon,
        None: null,
      },
      description: 'Icon to display at the start of the chip'
    },
    endIcon: {
      control: { type: 'select' },
      options: ['CrossIcon2', 'None'],
      mapping: {
        CrossIcon2: CrossIcon2,
        None: null,
      },
      description: 'Icon to display at the end of the chip (filter type only)'
    },
    label: {
      control: 'text',
      description: 'Text content of the chip'
    },
    type: {
      control: { type: 'select' },
      options: ['input', 'filter', 'avatar-input'],
      description: 'Type of chip to display (input or filter)'
    },
    id: {
      control: 'text',
      description: 'Unique identifier for the chip'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the chip is disabled'
    },
    isError: {
      control: 'boolean',
      description: 'Whether the chip should display in error state'
    },
    onClose: { action: 'closed' }
  }
};

// Common props for all stories
const commonProps = {
  label: 'Chip Label',
  id: 'chip-1',
  disabled: false,
  isError: false,
  onClose: action('chip-closed')
};

// 1. Input chip with left icon + DismissRegular
export const InputWithLeftIcon = {
  args: {
    ...commonProps,
    type: 'input',
    startIcon: BoxIcon
  },
  parameters: {
    docs: {
      description: {
        story: 'Input chip with BoxIcon on the left and DismissRegular on the right.'
      }
    }
  }
};

// 2. Input chip with only label + DismissRegular
export const InputWithOnlyLabel = {
  args: {
    ...commonProps,
    type: 'input',
    startIcon: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Input chip with only label and DismissRegular on the right.'
      }
    }
  }
};

// 3. Avatar input chip (avatar on left + DismissRegular)
export const AvatarInputChip = {
  args: {
    ...commonProps,
    type: 'avatar-input',
    label: 'User Name'
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar input chip with BoxIcon avatar on the left and DismissRegular on the right.'
      }
    }
  }
};

// 4. Filter chip with only label (no icons)
export const FilterWithOnlyLabel = {
  args: {
    ...commonProps,
    type: 'filter',
    startIcon: null,
    endIcon: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter chip with only label, no icons.'
      }
    }
  }
};

// 5. Filter chip with only left icon
export const FilterWithLeftIcon = {
  args: {
    ...commonProps,
    type: 'filter',
    startIcon: BoxIcon,
    endIcon: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter chip with BoxIcon on the left only.'
      }
    }
  }
};

// 6. Filter chip with only right icon
export const FilterWithRightIcon = {
  args: {
    ...commonProps,
    type: 'filter',
    startIcon: null,
    endIcon: CrossIcon2
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter chip with CrossIcon2 on the right only.'
      }
    }
  }
};

// 7. Filter chip with both left and right icons
export const FilterWithBothIcons = {
  args: {
    ...commonProps,
    type: 'filter',
    startIcon: BoxIcon,
    endIcon: CrossIcon2
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter chip with BoxIcon on the left and CrossIcon2 on the right.'
      }
    }
  }
};