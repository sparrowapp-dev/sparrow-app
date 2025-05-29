<script>
  import { base64ToURL, imageDataToURL } from "@sparrow/common/utils";
  import { GithubIcon, LinkedinOrgIcon, XIcon } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { Avatar } from "@sparrow/library/ui";
  export let tab;
  $: {
    console.log("Hub details page tab:", tab);
  }
</script>

<div
  class="d-flex flex-column"
  style="gap : 60px; padding: 12px; color: var(--text-ds-neutral-50);"
>
  <div class="d-flex flex-column" style="gap: 20px;">
    <div
      class="d-flex align-items-center sparrow-input-image-preview"
      style="gap : 8px;"
    >
      {#if !Array.isArray(tab.property?.hub?.logo) && tab.property?.hub?.logo.size > 0}
        {#if tab.property?.hub?.logo?.bufferString}
          <img
            class="rounded p-2"
            src={base64ToURL(tab.property?.hub?.logo)}
            alt=""
          />
        {:else}
          <img
            class="rounded p-2"
            src={imageDataToURL(tab.property?.hub?.logo)}
            alt=""
          />
        {/if}
      {:else}
        <Avatar
          type="letter"
          size="large"
          letter="T"
          bgColor="var(--bg-secondary-600)"
        />
      {/if}
      <span
        class="text-ds-font-size-28 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);"
        >{tab.property?.hub?.name}</span
      >
    </div>
    <hr style="color: var(--border-ds-surface-50);" />
    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex flex-column" style="gap: 20px; width: 60%;">
        <div class="d-flex flex-column" style="gap: 8px">
          <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
            >Hub Summary</span
          >
          <span>{tab?.property?.hub?.description || "No Summary Added."}</span>
        </div>
        <div class="d-flex flex-column" style="gap: 8px">
          <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
            >Owner</span
          >
          <span>{tab.property?.hub?.users[0]?.name}</span>
        </div>
      </div>
    </div>
  </div>
  <div
    class="d-flex flex-column"
    style=" gap: 20px; width: 30%; align-items: start;"
  >
    <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
      >Social Links</span
    >
    <div class="d-flex flex-row align-items-center" style="gap: 8px;">
      {#if tab.property?.hub?.githubUrl}
        <GithubIcon color="white" />
        <Button
          title={tab.property?.hub?.githubUrl || ""}
          type={"link-primary"}
          size="small"
        />
      {/if}
    </div>
    {#if tab.property?.hub?.linkedinUrl}
      <Button
        title={tab.property?.hub?.linkedinUrl || ""}
        type={"link-primary"}
        startIcon={LinkedinOrgIcon}
        size="small"
        buttonClassProp="ps-0 pe-1"
      />
    {/if}
    {#if tab.property?.hub?.xUrl}
      <Button
        title={tab.property?.hub?.xUrl || ""}
        type={"link-primary"}
        startIcon={XIcon}
        size="small"
        buttonClassProp="ps-0 pe-1"
      />
    {/if}
  </div>
</div>

<style lang="scss">
  .sparrow-input-image-preview > img {
    width: 80px;
    height: 80px;
  }
</style>
