/** @type { import('@storybook/svelte').Preview } */
import "../../@sparrow-storybook/src/stories/styles/style.scss";
const preview = {
  actions: { argTypesRegex: "^on.*" },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
