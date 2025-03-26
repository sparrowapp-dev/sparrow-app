import { Editor }from '@sparrow/library/forms';

export default {
  title: 'Components/Editor',
  component: Editor,
  argTypes: {
    lang: {
      control: { type: 'select' },
      options: ['HTML', 'JSON', 'XML', 'JavaScript', 'Text', 'Graphql'],
      description: 'Language syntax highlighting to apply'
    },
    value: {
      control: 'text',
      description: 'Content of the editor'
    },
    isEditable: {
      control: 'boolean',
      description: 'Whether the editor content can be edited'
    },
    isFormatted: {
      control: 'boolean',
      description: 'Whether to apply formatting to the code'
    },
    isBodyBeautified: {
      control: 'boolean',
      description: 'Trigger to beautify the code'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when editor is empty'
    },
    isErrorVisible: {
      control: 'boolean',
      description: 'Whether to show error highlighting'
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display when isErrorVisible is true'
    },
    errorStartIndex: {
      control: { type: 'number' },
      description: 'Start index of error highlight'
    },
    errorEndIndex: {
      control: { type: 'number' },
      description: 'End index of error highlight'
    },
    class: {
      control: 'text',
      description: 'Additional CSS classes to apply'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'A CodeMirror-based code editor component with syntax highlighting, formatting, and error display capabilities.'
      }
    }
  }
};

const Template = (args) => ({
  Component: Editor,
  props: args,
  on: {
    change: (e) => console.log('Content changed:', e.detail)
  }
});

export const DefaultText = Template.bind({});
DefaultText.args = {
  lang: 'Text',
  value: 'This is a simple text editor.',
  isEditable: true,
  isFormatted: false,
  isBodyBeautified: false,
  placeholder: 'Enter text here...',
  isErrorVisible: false,
  errorMessage: '',
  errorStartIndex: 0,
  errorEndIndex: 0,
  class: ''
};

export const JSONEditor = Template.bind({});
JSONEditor.args = {
  ...DefaultText.args,
  lang: 'JSON',
  value: '{\n  "name": "CodeMirror Editor",\n  "version": "1.0.0",\n  "features": ["syntax highlighting", "error checking", "formatting"]\n}',
  placeholder: 'Enter JSON here...'
};

export const HTMLEditor = Template.bind({});
HTMLEditor.args = {
  ...DefaultText.args,
  lang: 'HTML',
  value: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Sample Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>This is a sample HTML page.</p>\n</body>\n</html>',
  placeholder: 'Enter HTML here...'
};

export const JavaScriptEditor = Template.bind({});
JavaScriptEditor.args = {
  ...DefaultText.args,
  lang: 'JavaScript',
  value: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));',
  placeholder: 'Enter JavaScript here...'
};

export const ReadOnlyEditor = Template.bind({});
ReadOnlyEditor.args = {
  ...JSONEditor.args,
  isEditable: false
};

export const FormattedCode = Template.bind({});
FormattedCode.args = {
  ...JSONEditor.args,
  isFormatted: true
};

export const WithErrorHighlighting = Template.bind({});
WithErrorHighlighting.args = {
  ...JSONEditor.args,
  value: '{\n  "name": "CodeMirror Editor",\n  "version": 1.0.0,\n  "features": ["syntax highlighting", "error checking", "formatting"]\n}',
  isErrorVisible: true,
  errorMessage: 'Expected string but found number',
  errorStartIndex: 48,
  errorEndIndex: 53
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  ...DefaultText.args,
  value: '',
  placeholder: 'Type your code here...'
};

export const XMLEditor = Template.bind({});
XMLEditor.args = {
  ...DefaultText.args,
  lang: 'XML',
  value: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item id="1">\n    <name>Item One</name>\n    <value>100</value>\n  </item>\n</root>',
  placeholder: 'Enter XML here...'
};

export const GraphQLEditor = Template.bind({});
GraphQLEditor.args = {
  ...DefaultText.args,
  lang: 'Graphql',
  value: 'query GetUser {\n  user(id: "123") {\n    id\n    name\n    email\n    posts {\n      title\n    }\n  }\n}',
  placeholder: 'Enter GraphQL here...'
};