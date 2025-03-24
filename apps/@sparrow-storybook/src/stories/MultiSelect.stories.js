import { action } from '@storybook/addon-actions';
import{ MultiSelect} from '@sparrow/library/forms';

export default {
  title: 'Components/MultiSelect',
  component: MultiSelect,
};

// Sample data for our stories
const sampleData = [
  { id: 1, name: 'Option 1', checked: false },
  { id: 2, name: 'Option 2', checked: false },
  { id: 3, name: 'Option 3', checked: false },
  { id: 4, name: 'Option 4', checked: false },
  { id: 5, name: 'Option 5', checked: false },
];

const preSelectedData = [
  { id: 1, name: 'Option 1', checked: true },
  { id: 2, name: 'Option 2', checked: false },
  { id: 3, name: 'Option 3', checked: true },
  { id: 4, name: 'Option 4', checked: false },
  { id: 5, name: 'Option 5', checked: false },
];

// Helper function to create a story template
const createTemplate = (args) => ({
  Component: MultiSelect,
  props: args,
  on: {
    click: action('click')
  }
});

// Default story
export const Default = () => ({
  Component: MultiSelect,
  props: {
    id: 'default-multi-select',
    data: sampleData,
    isError: false,
    onclick: action('selections-changed')
  }
});

// With preselected options
export const WithPreselectedOptions = () => ({
  Component: MultiSelect,
  props: {
    id: 'preselected-multi-select',
    data: preSelectedData,
    isError: false,
    onclick: action('selections-changed')
  }
});

// With error state
export const WithError = () => ({
  Component: MultiSelect,
  props: {
    id: 'error-multi-select',
    data: sampleData,
    isError: true,
    onclick: action('selections-changed')
  }
});

export const EmptyState = () => ({
  Component: MultiSelect,
  props: {
    id: 'empty-multi-select',
    data: [],
    isError: false,
    onclick: action('selections-changed')
  }
});
