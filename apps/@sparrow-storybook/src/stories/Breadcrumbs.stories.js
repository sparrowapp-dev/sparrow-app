import{ Breadcrumbs }from '@sparrow/library/ui';

export default {
  title: 'Components/Breadcrumb',
  component: Breadcrumbs,
  tags: ['autodocs']
};

const Template = (args) => ({
  Component: Breadcrumbs,
  props: args,
});

export const Default = Template.bind({});
Default.args = {
  Breadcrumbs: [
    [
      { id: '1', name: 'Home' },
      { id: '2', name: 'Products' },
      { id: '3', name: 'Electronics' }
    ],
    [
      { id: '4', name: 'More Categories' }
    ],
    [
      { id: '5', name: 'Smartphones' }
    ]
  ],
  icon: null,
  onNavigate: (id) => console.log(`Navigated to: ${id}`)
};
