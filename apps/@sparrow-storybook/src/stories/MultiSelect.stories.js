import { action } from '@storybook/addon-actions';
import { MultiSelect } from '@sparrow/library/forms';

export default {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  // Add argTypes to provide more control and documentation
  argTypes: {
    id: { 
      control: 'text',
      description: 'Unique identifier for the MultiSelect component' 
    },
    data: { 
      control: 'object',
      description: 'Array of selectable options' 
    },
    isError: { 
      control: 'boolean',
      description: 'Enables error state for the component' 
    },
    onclick: { 
      action: 'selections-changed',
      description: 'Callback when selections change' 
    }
  }
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

// Comprehensive Error State Story with Debugging
export const Default = (args) => ({
  Component: MultiSelect,
  props: {
    id: 'error-multi-select-debug',
    data: sampleData,
    isError: false,
    // Enhanced error handling
    errorMessage: 'Please select at least one option',
    // Add a custom class for debugging
    class: 'debug-error-state',
    // Detailed onclick handler for tracing
    onclick: (event) => {
      console.log('MultiSelect onclick triggered:', event);
      action('selections-changed')(event);
    },
    // Add error state validation
    onErrorStateChange: (isError) => {
      console.log('Error state changed:', isError);
    }
  },
  // Add custom styles to highlight error state
  styles: `
    .debug-error-state {
      border: 2px solid red !important;
      background-color: rgba(255, 0, 0, 0.1) !important;
    }
  `
});

// Potential Issue Diagnostics Story
export const ErrorState = (args) => ({
  Component: MultiSelect,
  props: {
    id: 'error-state-diagnostics',
    data: sampleData,
    isError: true,
    // Add verbose logging and tracing
    oninit: () => {
      console.warn('MultiSelect initialized with error state');
    },
    onmount: () => {
      console.warn('MultiSelect mounted');
      // Check and log current error state
      const errorElement = document.querySelector('#error-state-diagnostics');
      if (errorElement) {
        console.log('Error element found:', errorElement);
        console.log('Current error classes:', errorElement.classList);
      }
    }
  }
});

