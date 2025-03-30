/** @type { import('@storybook/svelte').Preview } */
import "@sparrow/library/styles";
import "@sparrow/library/fluent-icons";
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
