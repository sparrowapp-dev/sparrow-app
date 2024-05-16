const Environments: string[] = [
  `When working with APIs, an environment is like the testing ground for your
code and the API to interact. It defines where your code and the API will
meet, specifying things like server locations, authentication details, and
other settings. Think of it as the virtual space where your code
communicates with the API.`,
  `To create a environment, simply click on the plus button in the left panel.`,
];
const Variables: string[] = [
  `  In the API world, variables are like the details you pass back and forth
between your code and the API. They serve as placeholders for information
such as user IDs, authentication tokens, or data you want to send or
receive. Variables act as the messengers, carrying specific details needed
for your code to talk effectively with the API.
`,
  `In Sparrow, you can define variables as key-value pairs. Simply enter the
variable name and it’s value.`,
];
const VariablesTypes: string[] = [
  `In Sparrow, you can define Global variables and Local variables within an
environment.`,
  `You can use global variables anywhere within your workspace, regardless of
which environment you have selected. But to use any variable that is defined
under an environment, you need to ensure that the environment is selected.
`,
];
const UsingVariables: string[] = [
  `To use variables in the REST API tool, start typing curly brackets and we
will show you all the variables that you have defined.`,
  `
All the global variables are marked with <span class="global-env-G">G</span>
    . Where as all local variables within an environment are marked with
    <span class="local-env-E">E</span>.`,
  `You can use variables in URL, query parameters, headers, authorization,
request body or anywhere else while testing a REST API request.`,
];
const SwitchingEnvironments: string[] = [
  `To switch an environment for API testing, select the dropdown present in the Top right corner.`,
];
const ProtectSensitiveinformation: string[] = [
  `In scenarios where confidentiality is key, you can safeguard variable values
by clicking on the lock icon. This will ensure that the variable value is
not disclosed to other people. Protecting a variable will also mask the
value in the UI. You can always unmask if necessary by clicking on the eye
icon. To remove the protection click back on the lock icon.
`,
  `In this example, the variable Authheader is protected and its value is not
revealed when sending any API requests.
`,
];

const QuickHelp = {
  environments: Environments,
  variables: Variables,
  variablesTypes: VariablesTypes,
  usingVariables: UsingVariables,
  switchingEnvironments: SwitchingEnvironments,
  protectSensitiveinformation: ProtectSensitiveinformation,
};
export { QuickHelp };
