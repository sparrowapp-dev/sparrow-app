<script>
  import { base64ToURL, imageDataToURL } from "@sparrow/common/utils";
  import { GithubIcon, LinkedinOrgIcon, XIcon } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { Avatar } from "@sparrow/library/ui";
  export let tab;
  function addHttps(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  }
</script>

<div
  class="d-flex flex-column"
  style="gap : 10px; padding: 12px; color: var(--text-ds-neutral-50);"
>
  <div class="d-flex flex-column">
    <div class="d-flex align-items-center" style="gap : 8px;">
      {#if tab.property?.hub?.logo?.size}
        <Avatar
          type="image"
          size="large"
          image={base64ToURL(tab.property?.hub?.logo)}
        />
      {:else}
        <Avatar
          type="letter"
          size="large"
          letter={tab.property?.hub?.name[0] ? tab.property?.hub?.name[0] : ""}
          bgColor="var(--bg-secondary-600)"
        />
      {/if}
      <span
        class="ellipsis overflow-hidden heading text-ds-font-size-28 text-ds-line-height-120 text-ds-font-weight-semi-bold"
        >{tab.property?.hub?.name || ""}
      </span>
    </div>
    <hr style="color: var(--border-ds-surface-50);" />
    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex flex-column" style="gap: 20px; width: 60%;">
        <div class="d-flex flex-column" style="gap: 8px">
          <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
            >Hub Summary</span
          >
          <span
            class="text-ds-font-size-14 text-ds-font-weight-regular text-ds-line-height-143"
            >{tab?.property?.hub?.description || "No Summary Added."}</span
          >
        </div>
        <div class="d-flex flex-column" style="gap: 8px">
          <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
            >Owner</span
          >
          <span
            class="text-ds-font-size-14 text-ds-font-weight-regular text-ds-line-height-143"
            >{tab.property?.hub?.users[0]?.name}</span
          >
        </div>
      </div>
    </div>
  </div>
  <hr style="color: var(--border-ds-surface-50);" />
  <div
    class="d-flex flex-column"
    style=" gap: 16px; width: 60%; align-items: start;"
  >
    <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
      >Social Links</span
    >
    {#if tab.property?.hub?.githubUrl}
      <div class="d-flex flex-row align-items-center">
        <GithubIcon color="white" />
        <a
          href={addHttps(tab.property?.hub?.githubUrl) || ""}
          target="_blank"
          style="text-decoration: none;"
        >
          <Button
            title={tab.property?.hub?.githubUrl || ""}
            type={"link-primary"}
            size="small"
            buttonClassProp="ps-2"
          />
        </a>
      </div>
    {/if}
    {#if tab.property?.hub?.linkedinUrl}
      <div class="d-flex flex-row align-items-center">
        <LinkedinOrgIcon />
        <a
          href={addHttps(tab.property?.hub?.linkedinUrl) || ""}
          target="_blank"
          style="text-decoration: none;"
        >
          <Button
            title={tab.property?.hub?.linkedinUrl || ""}
            type={"link-primary"}
            size="small"
            buttonClassProp="ps-2"
          />
        </a>
      </div>
    {/if}
    {#if tab.property?.hub?.xUrl}
      <div class="d-flex flex-row align-items-center">
        <XIcon />
        <a
          href={addHttps(tab.property?.hub?.xUrl) || ""}
          target="_blank"
          style="text-decoration: none;"
        >
          <Button
            title={tab.property?.hub?.xUrl || ""}
            type={"link-primary"}
            size="small"
            buttonClassProp="ps-2"
          />
        </a>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .heading {
    max-width: calc(100% - 150px);
  }
</style>
