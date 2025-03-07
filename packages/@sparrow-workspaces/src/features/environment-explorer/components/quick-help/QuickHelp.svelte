<script>
  import { closeIcon as cross } from "@sparrow/library/assets";
  import { QuickHelp } from "@sparrow/common/constants/environment.constant";
  import {
    inputField,
    variablesImg,
    envSelection,
  } from "@sparrow/workspaces/images";
  import { Button } from "@sparrow/library/ui";
  import { DismissRegular } from "@sparrow/library/icons";
  /**
   * callback which closes the quick help dialog
   */
  export let closeQuickHelp;
</script>

<div class="pt-3 d-flex flex-column quick-container h-100 gap-3" style="padding: 0px 24px 40px 12px;">
  <div class="d-flex justify-content-between" style="padding:12px 4px 4px 0px;">
    <div>
      <h4 class="head-title">Quick help</h4>
    </div>
    <Button
    type="outline-secondary"
    startIcon={DismissRegular}
    onClick={() => {
      closeQuickHelp();
    }}
    size="small"
    customWidth="28px"
   />
  </div>
  <div style="flex:1; overflow:auto;display:flex;flex-direction:column; gap: 16px;">
    <div style="display:flex;flex-direction:column; gap: 4px;">
      <h6 class="heading-title ">Environments</h6>
    {#each QuickHelp.environments as env}
      <p class="heading-para">
        {env}
      </p>
    {/each}
    </div>

    <div style="display:flex;flex-direction:column; gap: 4px;">
      <h6 class="heading-title ">Variables</h6>
    {#each QuickHelp.variables as variables}
      <p class="heading-para">
        {variables}
      </p>
    {/each}
    </div>

    <div style="display:flex;flex-direction:column; gap: 4px;">
      <h6 class="heading-title ">Variables Types</h6>
    {#each QuickHelp.variablesTypes as types}
      <p class="heading-para">
        {types}
      </p>
    {/each}
    </div>

  <div style="display:flex;flex-direction:column; gap: 4px;">
      <h6 class="heading-title ">Using Variables in REST API tool</h6>
    <p class="heading-para">
      {QuickHelp.usingVariables[0]}
    </p>
    <p><img class="w-100" src={inputField} alt="" /></p>
    <p><img class="" src={variablesImg} alt="" /></p>
    <p class="heading-para">
      {@html QuickHelp.usingVariables[1]}
    </p>
    <p class="heading-para">
      {QuickHelp.usingVariables[2]}
    </p>
    </div>

    <div style="display:flex;flex-direction:column; gap: 4px;">
      <h6 class="heading-title ">Switching Environments</h6>
    {#each QuickHelp.switchingEnvironments as switchEnv}
      <p class="heading-para">
        {switchEnv}
      </p>
    {/each}

    <p style="margin-left:-12px"><img class="" src={envSelection} alt="" /></p>
    </div>

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
      font-weight: 500;
      margin-bottom: 0px;
    }
    .heading-para {
      font-size: 12px;
      color:var(--text-ds-neutral-400);
      line-height: 18px;
      margin-bottom: 0px ;
   
    }
    .head-title {
      font-size: 20px;
      font-weight: 600;
    }
    .icon {
      cursor: pointer;
    }
    :global(.local-env-E) {
      color: var(--text-ds-success-400);
    }
    :global(.global-env-G) {
      color: var(--text-ds-primary-400);
    }
  }
</style>
