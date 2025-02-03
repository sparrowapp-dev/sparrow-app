// import Button from './Button.svelte'; // Uncomment if you're using a local component

import { Search } from "@sparrow/library/forms";
import { Button } from "@sparrow/library/ui"; // Adjust import based on your package structure

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: "Components/SearchBar",
  component: Search,
  tags: ["autodocs"],
  argTypes: {
    PlaceholderValue: { control: "text", defaultValue: "Search" },
    customWidth: { control: "number" },
    searchStyleProp: { control: "text" },
    searchTextProp: { control: "text" },
    type: { control: "select", options: ["surface700", "surface900", "other"] },
    size: { control: "select", options: ["medium", "large", "other"] },
    id: { control: "text" },
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const surface700 = {
  args: {
    placeholderValue: "Search in surfa",
    type: "surface900",
    PlaceholderValue: "kjfrkjbfkrejkjkb\n",
    size: "large",
    value: "",
    customWidth: 440,
    searchTextProp: 'color:"white";',
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const surface900 = {
  args: {
    placeholderValue: "Search in surface900",
    type: "surface900",
  },
};
