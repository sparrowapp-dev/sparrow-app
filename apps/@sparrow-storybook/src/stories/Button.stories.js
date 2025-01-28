// import Button from './Button.svelte'; // Uncomment if you're using a local component
import { ButtonV3 } from "@sparrow/library/ui"; // Adjust import based on your package structure

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: "Components/Button",
  component: ButtonV3,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text", defaultValue: "Submit" },
    onClick: { action: "clicked" },
    loader: { control: "boolean" },
    loaderSize: { control: "number" },
    disable: { control: "boolean" },
    buttonSize: { control: "number", default: 24 },
    iconSize: { control: "number", default: 24 },
    buttonStyleProp: { control: "text" },
    buttonClassProp: { control: "text" },
    textClassProp: { control: "text" },
    textStyleProp: { control: "text" },
    buttonStartIcon: { control: "text" },
    buttonStartIconStyle: { control: "text" },
    allowChild: { control: "boolean" },
    type: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "dark",
        "danger",
        "violet",
        "transparent",
        "outline",
        "teritiary-regular",
        "teritiary-danger",
        "underline",
        "outline-primary",
        "outline-secondary",
        "outline-danger",

        "icon-primary",
        "icon-secondary",
        "icon-danger",
        "outline-icon-primary",
        "outline-icon-secondary",
        "outline-icon-danger",
        "teritiary-icon-regular",
        "teritiary-icon-danger",
        "other",
      ],
    },
    id: { control: "text" },
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    title: "Submit",
    buttonStyleProp: "",
    type: "secondary",
    size: "medium",
    buttonSize: 54,
    disable: false,
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Red = {
  args: {
    title: "Submit",
    textStyleProp: "background-color:red;",
  },
};

export const Dark = {
  args: {
    title: "Submit",
    type: "dark",
    size: "large",
  },
};

export const Danger = {
  args: {
    title: "Delete",
    type: "danger",
    size: "large",
  },
};

export const Transparent = {
  args: {
    title: "Cancel",
    type: "transparent",
  },
};

export const WithLoader = {
  args: {
    title: "Loading...",
    loader: true,
    loaderSize: 20,
    type: "other",
  },
};

export const WithIcon = {
  args: {
    title: "Submit",
    type: "icon",
    buttonStartIcon: "path/to/icon.svg", // Replace with a valid icon URL or path
  },
};

export const WithCustomChild = {
  args: {
    allowChild: true,
  },
  // Use the `slots` property to insert content inside the button's slot
  // This will make the button render with custom child content
  slots: {
    default: "<span>Custom Child Content</span>",
  },
};
