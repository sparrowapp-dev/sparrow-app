import { Breadcrumbs } from '@sparrow/library/ui';
import { FolderIcon } from '@sparrow/library/icons';

/**
 * The Breadcrumbs component provides navigation context by showing the user's 
 * current location within the application hierarchy with a dropdown for 
 * intermediary items when the path becomes too long.
 */
export default {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    breadcrumbs: { control: 'object', description: 'Array of breadcrumb sections' },
    icon: { control: 'object', description: 'Icon component to display before each breadcrumb' },
    onNavigate: { action: 'navigated', description: 'Callback when breadcrumb is clicked' },
  },
};

// Mock data for the breadcrumbs with three sections
const breadcrumbsData = [
  // First section - always visible
  [
    { id: 'home', name: 'Home' },
    { id: 'projects', name: 'Projects' }
  ],
  // Middle section - collapsed into dropdown
  [
    { id: 'frontend', name: 'Frontend' },
    { id: 'backend', name: 'Backend' },
    { id: 'devops', name: 'DevOps' },
    { id: 'design', name: 'Design' }
  ],
  // Last section - always visible
  [
    { id: 'component', name: 'Component' },
    { id: 'breadcrumb', name: 'Breadcrumb' }
  ]
];



// Simple breadcrumbs with only one section
export const Default = {
  args: {
    breadcrumbs: [
      [
        { id: 'home', name: 'Home' },
        { id: 'projects', name: 'Projects' },
        { id: 'frontend', name: 'Frontend' }
      ]
    ],
    icon: FolderIcon,
  },
};
// Default breadcrumbs with all sections
export const LongBreadcrumbs = {
  args: {
    breadcrumbs: breadcrumbsData,
    icon: FolderIcon,
  },
};
// // Breadcrumbs with long names to demonstrate ellipsis behavior
// export const LongNames = {
//   args: {
//     breadcrumbs: [
//       [
//         { id: 'home', name: 'Home' },
//         { id: 'projects', name: 'Project Management Dashboardnnnnnnnnnnnnnnnnndisha dusga' }
//       ],
//       [
//         { id: 'frontend', name: 'Frontend Development Resourceskjjjk' },
//         { id: 'backend', name: 'Backend System Architecture' },
//         { id: 'devops', name: 'DevOps Infrastructure Management' }
//       ],
//       [
//         { id: 'component', name: 'Component Library Documentation' },
//         { id: 'breadcrumb', name: 'Breadcrumb Navigation Implementation' }
//       ]
//     ],
//     icon: FolderIcon,
//   },
// };
