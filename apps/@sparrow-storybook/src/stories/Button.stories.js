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
    title: "",
    buttonStyleProp: "",
    type: "icon-primary",
    size: "medium",
    buttonSize: 54,
    disable: false,
    iconImage: "",
    buttonIcon:
      '"data:image/jpeg;base64,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"',
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

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
