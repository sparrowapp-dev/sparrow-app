<script>
  import cross from "$lib/assets/close.svg";
  import environment from "$lib/assets/environment.png";
  import dropdown from "$lib/assets/environment-dropdown.png";
  import variables from "$lib/assets/variables.png";
  export let closeQuickHelp;
</script>

<div class="px-3 py-4 quick-container">
  <div class="d-flex justify-content-between">
    <div>
      <h4 class="head-title pb-3">Quick help</h4>
    </div>
    <div class="icon">
      <img
        src={cross}
        on:click={() => {
          closeQuickHelp();
        }}
        alt="close"
      />
    </div>
  </div>
  <h6 class="heading-title">Environments</h6>
  <p class="heading-para text-textColor">
    When working with APIs, an environment is like the testing ground for your
    code and the API to interact. It defines where your code and the API will
    meet, specifying things like server locations, authentication details, and
    other settings. Think of it as the virtual space where your code
    communicates with the API.
  </p>
  <p class="heading-para text-textColor">
    To create a environment, simply click on the plus button in the left panel.
  </p>

  <h6 class="heading-title">Variables</h6>
  <p class="heading-para text-textColor">
    In the API world, variables are like the details you pass back and forth
    between your code and the API. They serve as placeholders for information
    such as user IDs, authentication tokens, or data you want to send or
    receive. Variables act as the messengers, carrying specific details needed
    for your code to talk effectively with the API.
  </p>
  <p class="heading-para text-textColor">
    In Sparrow, you can define variables as key-value pairs. Simply enter the
    variable name and it’s value.
  </p>

  <h6 class="heading-title">Variables Types</h6>
  <p class="heading-para text-textColor">
    In Sparrow, you can define Global variables and Local variables within an
    environment.
  </p>
  <p class="heading-para text-textColor">
    You can use global variables anywhere within your workspace, regardless of
    which environment you have selected. But to use any variable that is defined
    under an environment, you need to ensure that the environment is selected.
  </p>

  <h6 class="heading-title">Using Variables in REST API tool</h6>
  <p class="heading-para text-textColor">
    To use variables in the REST API tool, start typing curly brackets and we
    will show you all the variables that you have defined.
  </p>
  <p><img class="w-100" src={environment} alt="" /></p>
  <p class="heading-para text-textColor">
    All the global variables are marked with G. Where as all local variables
    within an environment are marked with E.
  </p>
  <p class="heading-para text-textColor">
    You can use variables in URL, query parameters, headers, authorization,
    request body or anywhere else while testing a REST API request.
  </p>

  <h6 class="heading-title">Switching Environments</h6>
  <p class="heading-para text-textColor">
    To switch an environment for API testing, select the dropdown present in the
    collections list side panel in the REST API tool.
  </p>
  <p><img class="w-100" src={dropdown} alt="" /></p>

  <h6 class="heading-title">Protect Sensitive information</h6>
  <p class="heading-para text-textColor">
    In scenarios where confidentiality is key, you can safeguard variable values
    by clicking on the lock icon. This will ensure that the variable value is
    not disclosed to other people. Protecting a variable will also mask the
    value in the UI. You can always unmask if necessary by clicking on the eye
    icon. To remove the protection click back on the lock icon.
  </p>
  <p><img class="w-100" src={variables} alt="" /></p>
  <p class="heading-para text-textColor">
    In this example, the variable Authheader is protected and its value is not
    revealed when sending any API requests.
  </p>
</div>

<style lang="scss">
  .quick-container {
    border-left: 1px solid var(--border-color);

    .heading-title {
      font-size: 16px;
    }
    .heading-para {
      font-size: 12px;
    }
    .head-title {
      font-size: 18px;
    }
    .icon {
      cursor: pointer;
    }
  }
</style>
