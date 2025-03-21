<script>
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import {Popover} from '@sparrow/library/ui';

  const handleClose = () => {
    console.log('Popover closed');
  };
</script>

<Meta 
  title="Components/Popover"
  component={Popover},
  argTypes={{
    heading: {
      control: 'text',
      description: 'The heading text displayed at the top of the popup',
      defaultValue: 'Popup Title'
    },
    onClose: {
      action: 'closed',
      description: 'Function called when the close button is clicked'
    }
  }}
  parameters={{
    docs: {
      description: {
        component: 'A simple popup component with a heading and close button. All content is passed via slots.'
      }
    },
    autodocs: true,
  }}
/>

<Template let:args>
  <Popover {...args}>
    <slot />
  </Popover>
</Template>

<Story 
  name="Default"
  args={{
    heading: 'Popup Title',
    onClose: handleClose
  }}
/>

<Story 
  name="WithContent"
  args={{
    heading: 'Popup with Content',
    onClose: handleClose
  }}
>
  <p class="mb-2 text-fs-12">
    Your one-stop solution for API testing and management. Start
    organizing your API requests into collections, utilize environment
    variables, and streamline your development process.
  </p>
  <div class="d-flex justify-content-between align-items-center">
    <button class="btn btn-sm btn-primary">Get Started</button>
    <span class="link p-0 border-0" style="font-size: 12px; cursor: pointer;">
      See how it works
    </span>
  </div>
</Story>