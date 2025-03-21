<script>
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import { ImageModal } from '@sparrow/library/ui';
  import { Button } from '@sparrow/library/ui';

  let isModalOpen = false;

  const handleModalState = (flag) => {
    isModalOpen = flag;
    console.log('Modal state changed to:', flag);
  };

  const openModal = () => {
    isModalOpen = true;
  };
</script>

<Meta 
  title="Components/Modal"
  component={ImageModal}
  argTypes={{
    title: {
      control: 'text',
      description: 'The title text displayed at the top of the modal',
      defaultValue: 'Modal Title'
    },
    type: {
      control: { type: 'select' },
      options: ['primary', 'dark', 'danger'],
      description: 'Determines the visual style of the modal',
      defaultValue: 'dark'
    },
    width: {
      control: 'text',
      description: 'The width of the modal (CSS value)',
      defaultValue: '35%'
    },
    height: {
      control: 'text',
      description: 'The maximum height of the modal (CSS value)',
      defaultValue: '35%'
    },
    canClose: {
      control: 'boolean',
      description: 'Whether clicking the overlay closes the modal',
      defaultValue: true
    },
    zIndex: {
      control: 'number',
      description: 'Z-index for the modal (recommended values: 1, 100, 1000, etc)',
      defaultValue: 1000
    },
    icon: {
      control: { type: 'select' },
      options: ['', 'warning'],
      description: 'Optional icon to display next to the title',
      defaultValue: ''
    },
    isCrossButton: {
      control: 'boolean',
      description: 'Whether to show the close button',
      defaultValue: true
    },
    handleModalState: {
      action: 'modalStateChanged',
      description: 'Function called when the modal state changes'
    }
  }}
  parameters={{
    docs: {
      description: {
        component: 'A flexible modal component with customizable appearance and behavior. The modal can be styled with different themes, sizes, and includes options for icons and closing behavior.'
      }
    },
    autodocs: true,
  }}
/>

<div>
  <Button on:click={openModal}>Open Modal</Button>
  
  <Template let:args>
    <ImageModal {...args} isOpen={isModalOpen} handleModalState={handleModalState}>
      <slot />
    </ImageModal>
  </Template>
</div>

<Story 
  name="Default"
  args={{
    title: 'Default Modal',
    type: 'dark',
    width: '400px',
    height: '300px'
  }}
>
  <p class="text-white">This is a basic modal with default settings.</p>
  <div class="d-flex justify-content-end mt-3">
    <Button on:click={() => handleModalState(false)}>Close</Button>
  </div>
</Story>

<Story 
  name="Warning"
  args={{
    title: 'Warning Modal',
    type: 'dark',
    icon: 'warning',
    width: '450px',
    height: '250px'
  }}
>
  <p>This action cannot be undone. Are you sure you want to proceed?</p>
  <div class="d-flex justify-content-end gap-2 mt-3">
    <Button variant="outline-secondary" on:click={() => handleModalState(false)}>Cancel</Button>
    <Button variant="danger" on:click={() => handleModalState(false)}>Delete</Button>
  </div>
</Story>

<Story 
  name="LargeContent"
  args={{
    title: 'Modal with Scrollable Content',
    type: 'dark',
    width: '500px',
    height: '400px'
  }}
>
  <div>
    <p class="text-white">This modal contains a larger amount of content that will scroll within the modal body.</p>
    <p class="text-white" >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p>
    <p class="text-white">Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
    <p class="text-white">Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.</p>
    <div class="d-flex justify-content-end mt-3">
      <Button on:click={() => handleModalState(false)} title="Close">Close</Button>
    </div>
  </div>
</Story>