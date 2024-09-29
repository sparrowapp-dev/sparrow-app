<script>
  import cross from "@deprecate/assets/close.svg";
  import environment from "@deprecate/assets/environment.png";
  import dropdown from "@deprecate/assets/environment-dropdown.png";
  import variables from "@deprecate/assets/variables.png";
  import { QuickHelp } from "@deprecate/utils/constants/environment.constant";
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
  {#each QuickHelp.environments as env}
    <p class="heading-para text-textColor">
      {env}
    </p>
  {/each}

  <h6 class="heading-title">Variables</h6>
  {#each QuickHelp.variables as variables}
    <p class="heading-para text-textColor">
      {variables}
    </p>
  {/each}

  <h6 class="heading-title">Variables Types</h6>
  {#each QuickHelp.variablesTypes as types}
    <p class="heading-para text-textColor">
      {types}
    </p>
  {/each}

  <h6 class="heading-title">Using Variables in REST API tool</h6>
  <p class="heading-para text-textColor">
    {QuickHelp.usingVariables[0]}
  </p>
  <p><img class="w-100" src={environment} alt="" /></p>
  <p class="heading-para text-textColor">
    {@html QuickHelp.usingVariables[1]}
  </p>
  <p class="heading-para text-textColor">
    {QuickHelp.usingVariables[2]}
  </p>

  <h6 class="heading-title">Switching Environments</h6>
  {#each QuickHelp.switchingEnvironments as switchEnv}
    <p class="heading-para text-textColor">
      {switchEnv}
    </p>
  {/each}

  <p><img class="w-100" src={dropdown} alt="" /></p>

  <!-- <h6 class="heading-title">Protect Sensitive information</h6>
  <p class="heading-para text-textColor">
    {QuickHelp.protectSensitiveinformation[0]}
  </p>
  <p><img class="w-100" src={variables} alt="" /></p>
  <p class="heading-para text-textColor">
    {QuickHelp.protectSensitiveinformation[1]}
  </p> -->
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
    :global(.local-env-E) {
      color: var(--request-patc);
    }
    :global(.global-env-G) {
      color: var(--request-con);
    }
  }
</style>
