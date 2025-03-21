import {Options} from '@sparrow/library/ui';
import { EditIcon, deleteIcon, SearchIcon , SettingIcon } from '@sparrow/library/icons';

/**
 * A dropdown menu component that displays a list of options with icons.
 * The menu appears at the specified position and adjusts its position if it would overflow the viewport.
 */
export default {
  title: 'Components/Options',
  component: Options,
  tags: ['autodocs'],
  argTypes: {
    isTabMenu: { control: 'boolean' },
    xAxis: { control: 'number' },
    yAxis: { control: 'array' },
    noOfColumns: { control: 'number' },
    zIndex: { control: 'number' },
    menuItems: { control: 'object' }
  },
};

export const Default = {
  args: {
    isTabMenu: false,
    xAxis: 100,
    noOfColumns: 180,
    zIndex: 4,
    menuItems: [
      {
        onClick: () => console.log('Edit clicked'),
        displayText: 'Edit',
        icon: EditIcon,
        iconColor: 'var(--text-ds-neutral-50)'
      },
      {
        onClick: () => console.log('Share clicked'),
        displayText: 'Share',
        icon: SearchIcon,
        iconColor: 'var(--text-ds-neutral-50)'
      },
      {
        onClick: () => console.log('Settings clicked'),
        displayText: 'Settings',
        icon: SettingIcon,
        iconColor: 'var(--text-ds-neutral-50)'
      },
    ]
  }
};

export const WithDisabledItem = {
  args: {
    ...Default.args,
    menuItems: [
      {
        onClick: () => console.log('Edit clicked'),
        displayText: 'Edit',
        icon: EditIcon,
        iconColor: 'var(--text-ds-neutral-50)'
      },
      {
        onClick: () => console.log('Share clicked'),
        displayText: 'Share',
        icon: SearchIcon,
        iconColor: 'var(--text-ds-neutral-50)',
        disabled: true
      },
      {
        onClick: () => console.log('Settings clicked'),
        displayText: 'Settings',
        icon: SettingIcon,
        iconColor: 'var(--text-ds-neutral-50)'
      }
    ]
  }
};