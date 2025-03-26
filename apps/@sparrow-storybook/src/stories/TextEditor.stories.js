// TextEditor.stories.js
import {TextEditor} from '@sparrow/library/forms';

export default {
  title: 'Components/TextEditor',
  component: TextEditor,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    id: { control: 'text' },
    isReadOnly: { control: 'boolean' },
    placeholder: { control: 'text' },
    onInput: { action: 'onInput' }
  },
  parameters: {
    docs: {
      description: {
        component: 'A rich text editor component based on Editor.js that supports formatting, headings, lists, and code blocks.'
      }
    }
  }
};

// Default view of the editor
export const Default = {
  render: (args) => ({
    Component: TextEditor,
    props: args
  }),
  args: {
    id: 'editorjs',
    value: '[]',
    placeholder: 'Start typing...',
    isReadOnly: false
  }
};
