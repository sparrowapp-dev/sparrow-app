// Navigator.stories.js
import { Navigator } from '@sparrow/library/ui';
import { StackRegular } from '@sparrow/library/icons';
import { SettingIcon } from '@sparrow/library/icons';
import { PersonIcon } from '@sparrow/library/icons';


// Basic export with minimal configuration
export default {
  title: 'Components/Navigator',
  component: Navigator
};

export const BasicTabs = () => ({
  Component: Navigator,
  props: {
    tabs: [
      { id: 'home', name: 'Home', icon: StackRegular },
      { id: 'users', name: 'Users', icon: PersonIcon, count: 5 },
      { id: 'settings', name: 'Settings', icon: SettingIcon }
    ],
    currentTabId: 'home',
    onTabClick: (id) => console.log(`Tab clicked: ${id}`)
  }
});

export const NoIcons = () => ({
  Component: Navigator,
  props: {
    tabs: [
      { id: 'home', name: 'Home' },
      { id: 'users', name: 'Users' },
      { id: 'settings', name: 'Settings' }
    ],
    currentTabId: 'home',
    onTabClick: (id) => console.log(`Tab clicked: ${id}`)
  }
});