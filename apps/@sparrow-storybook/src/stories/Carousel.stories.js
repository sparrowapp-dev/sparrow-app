import { Carousel } from '@sparrow/library/ui';

/**
 * The Carousel component displays a sequence of steps with images, headings, and subheadings.
 * It provides navigation controls and indicators for moving between steps.
 */
export default {
  title: 'Components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    data: { control: 'object' },
    handleClosePopup: { action: 'closed' },
  },
};

// Mock data for the carousel
const carouselData = [
  {
    gif: "https://sparrowassets.blob.core.windows.net/publicassest/sparrow-logo.png",
    heading: 'Welcome to Sparrow',
    subheading: 'Discover the powerful features that will enhance your workflow.'
  },
  {
    gif: 'https://sparrowassets.blob.core.windows.net/publicassest/sparrow-logo.png',
    heading: 'Customize Your Experience',
    subheading: 'Personalize your workspace to match your unique preferences and needs.'
  },
  {
    gif: 'https://sparrowassets.blob.core.windows.net/publicassest/sparrow-logo.png',
    heading: 'Collaborate With Your Team',
    subheading: 'Share and work together seamlessly with integrated collaboration tools.'
  },
  {
    gif: 'https://sparrowassets.blob.core.windows.net/publicassest/sparrow-logo.png',
    heading: 'Get Started Now',
    subheading: 'Jump right in and begin creating amazing projects with Sparrow.'
  }
];

// Default Carousel
export const Default = {
  args: {
    data: carouselData,
  },
};

