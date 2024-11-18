<script>
  import { closeIcon as cross } from "@sparrow/library/assets";
  import { QuickHelp } from "@sparrow/common/constants/environment.constant";
  import {
    environmentDropdown,
    environmentPicker,
  } from "@sparrow/workspaces/images";
  /**
   * callback which closes the quick help dialog
   */
  export let closeQuickHelp;
</script>

<div class="px-3 pt-4 pb-2 d-flex flex-column quick-container h-100">
  <div class="d-flex justify-content-between">
    <div>
      <h4 class="head-title pb-3">Quick help</h4>
    </div>
    <div class="icon">
      <img
        src={cross}
        role="button"
        on:click={() => {
          closeQuickHelp();
        }}
        alt="close"
      />
    </div>
  </div>
  <div class="pe-1" style="flex:1; overflow:auto;">
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
    <p><img class="w-100" src={environmentPicker} alt="" /></p>
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

    <p><img class="w-60" src={environmentDropdown} alt="" /></p>

    <!-- <h6 class="heading-title">Protect Sensitive information</h6>
      <p class="heading-para text-textColor">
        {QuickHelp.protectSensitiveinformation[0]}
      </p>
      <p><img class="w-100" src={variables} alt="" /></p>
      <p class="heading-para text-textColor">
        {QuickHelp.protectSensitiveinformation[1]}
      </p> -->
  </div>
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
