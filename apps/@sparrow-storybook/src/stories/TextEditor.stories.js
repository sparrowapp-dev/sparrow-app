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

// // Read-only view of the editor
// export const ReadOnly = {
//   render: (args) => ({
//     Component: TextEditor,
//     props: args
//   }),
//   args: {
//     id: 'editorjs-readonly',
//     value: JSON.stringify([
//       {
//         type: 'header',
//         data: {
//           text: 'Read-only Editor',
//           level: 2
//         }
//       },
//       {
//         type: 'paragraph',
//         data: {
//           text: 'This is a read-only version of the editor with some example content.'
//         }
//       },
//       {
//         type: 'list',
//         data: {
//           style: 'unordered',
//           items: [
//             'Item 1',
//             'Item 2',
//             'Item 3'
//           ]
//         }
//       },
//       {
//         type: 'code',
//         data: {
//           code: 'function helloWorld() {\n  console.log("Hello, world!");\n}'
//         }
//       }
//     ]),
//     isReadOnly: true
//   }
// };

// // With pre-filled markdown content
// export const WithMarkdownContent = {
//   render: (args) => ({
//     Component: TextEditor,
//     props: args
//   }),
//   args: {
//     id: 'editorjs-markdown',
//     value: '## Markdown Content\n\nThis content is provided as markdown and will be converted to Editor.js blocks.\n\n- List item 1\n- List item 2\n- List item 3\n\n`const code = "inline code example";`',
//     placeholder: 'Type something...',
//     isReadOnly: false
//   }
// };

// // With placeholder
// export const WithPlaceholder = {
//   render: (args) => ({
//     Component: TextEditor,
//     props: args
//   }),
//   args: {
//     id: 'editorjs-placeholder',
//     value: '[]',
//     placeholder: 'Write your amazing content here...',
//     isReadOnly: false
//   }
// };

// export const Interactive = {
//   render: (args) => ({
//     Component: TextEditor,
//     props: args
//   }),
//   args: {
//     id: 'editorjs-interactive',
//     value: '[]',
//     placeholder: 'Try me out! Type something...',
//     isReadOnly: false
//   }
// };
