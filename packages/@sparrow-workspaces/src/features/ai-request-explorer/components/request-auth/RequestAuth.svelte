<script lang="ts">
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "./sub-auth";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import type { HttpRequestCollectionLevelAuthTabInterface } from "@sparrow/common/types/workspace";
  import { CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
  import { HttpRequestAuthTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import { Alert, Button } from "@sparrow/library/ui";
  import { OpenRegular } from "@sparrow/library/icons";

  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  export let auth;
  export let environmentVariables;
  export let requestStateAuth;
  export let onUpdateRequestAuth;
  export let onUpdateRequestState;
  export let onUpdateEnvironment;
  export let collectionAuth: HttpRequestCollectionLevelAuthTabInterface;
  export let collection;
  export let onOpenCollection;
  const handlecollection_ai_tab_auth_changed = ({
    aiAuthNavigation,
  }: {
    aiAuthNavigation: string;
  }) => {
    captureEvent("ai_auth_changed", {
      component: "RequestAuth",
      button_text: aiAuthNavigation,
      destination: aiAuthNavigation,
    });
  };
</script>

<div class="d-flex flex-column w-100 h-100">
  <div class="pb-2" style="font-size: 12px; font-weight:500;">
    <div class="">
      <span class="d-flex">
        <p class="mb-0">
          <WithSelect
            id={"hash999"}
            data={[
              {
                name: "No Auth",
                id: HttpRequestAuthTypeBaseEnum.NO_AUTH,
              },
              // {
              //   name: "Inherit Auth",
              //   id: HttpRequestAuthTypeBaseEnum.INHERIT_AUTH,
              // },
              {
                name: "API Key",
                id: HttpRequestAuthTypeBaseEnum.API_KEY,
              },
              // {
              //   name: "Bearer Token",
              //   id: HttpRequestAuthTypeBaseEnum.BEARER_TOKEN,
              // },
              // {
              //   name: "Basic Auth",
              //   id: HttpRequestAuthTypeBaseEnum.BASIC_AUTH,
              // },
            ]}
            zIndex={499}
            titleId={requestStateAuth}
            onclick={(id = "") => {
              onUpdateRequestState({ aiAuthNavigation: id });
              handlecollection_ai_tab_auth_changed({
                aiAuthNavigation: id,
              });
            }}
            disabled={false}
          />
        </p>
      </span>
    </div>
  </div>
  <div>
    <p
      class="text-ds-font-size-12 text-ds-font-weight-regular"
      style="color:var(--text-ds-neutral-400)"
    >
      Add the API key of your selected AI model.
    </p>
  </div>

  <Alert
    heading="OpenAI API Key"
    description=""
    varient="info"
    ctaShow={false}
    containerWidth={""}
    closeIconRequired={false}
    onClickClose={() => {}}
  >
    <ul
      slot="body-slot"
      class="alert-bullet-list text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-150 ps-3 mt-1 me-0 mb-2 ms-1"
    >
      <li class="alert-bullet-item position-relative">
        Go to <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          class="alert-link text-ds-font-size-12"
          >OpenAI API Keys page<span class="external-arrow">↗</span></a
        >.
      </li>
      <li class="alert-bullet-item position-relative">
        Click on <strong>Create new secret key</strong>.
      </li>
      <li class="alert-bullet-item position-relative">
        Copy the key and paste it below.
      </li>
    </ul>
  </Alert>

  <section class="w-100" style="flex:1; overflow:auto;">
    {#if requestStateAuth === HttpRequestAuthTypeBaseEnum.NO_AUTH}
      <NoAuth />
    {:else if requestStateAuth === HttpRequestAuthTypeBaseEnum.API_KEY}
      <ApiKey
        apiData={auth.apiKey}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === HttpRequestAuthTypeBaseEnum.BEARER_TOKEN}
      <BearerToken
        bearerToken={auth.bearerToken}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === HttpRequestAuthTypeBaseEnum.BASIC_AUTH}
      <BasicAuth
        basicAuth={auth.basicAuth}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === HttpRequestAuthTypeBaseEnum.INHERIT_AUTH}
      {#if collectionAuth?.collectionAuthNavigation === CollectionAuthTypeBaseEnum.NO_AUTH}
        <p class="text-fs-16">No Auth</p>
        <NoAuth />
      {:else if collectionAuth?.collectionAuthNavigation === CollectionAuthTypeBaseEnum.API_KEY}
        <p class="text-fs-16">API Key</p>
        <ApiKey
          apiData={collectionAuth.auth.apiKey}
          callback={() => {}}
          {environmentVariables}
          {onUpdateEnvironment}
          disabled={true}
        />
      {:else if collectionAuth?.collectionAuthNavigation === CollectionAuthTypeBaseEnum.BEARER_TOKEN}
        <p class="text-fs-16">Bearer Token</p>
        <BearerToken
          bearerToken={collectionAuth.auth.bearerToken}
          callback={() => {}}
          {environmentVariables}
          {onUpdateEnvironment}
          disabled={true}
        />
      {:else if collectionAuth?.collectionAuthNavigation === CollectionAuthTypeBaseEnum.BASIC_AUTH}
        <p class="text-fs-16">Basic Auth</p>
        <BasicAuth
          basicAuth={collectionAuth.auth.basicAuth}
          callback={() => {}}
          {environmentVariables}
          {onUpdateEnvironment}
          disabled={true}
        />
      {/if}
      {#if collection}
        <p
          class="text-fs-12 mb-1"
          style="color:var(--text-ds-neutral-400); max-width:600px;"
        >
          The authorization setting is inherited from the collection '<span
            style="color:var(--text-ds-neutral-100)"
            >{collection?.name || "Collection Not Found"}</span
          >'. To make changes,
        </p>
        <p class="d-flex">
          <span
            class="pt-1 text-fs-12 me-1"
            style="color:var(--text-ds-neutral-400)"
          >
            navigate to
          </span>
          <Button
            type={"link-primary"}
            onClick={() => {
              onOpenCollection();
            }}
            title={collection?.name?.length > 25
              ? collection?.name?.slice(0, 25) + "..."
              : collection?.name || "Collection Not Found"}
            size={"small"}
            endIcon={OpenRegular}
          />
        </p>
      {/if}
    {/if}
  </section>
</div>

<style>
  button:hover {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }

  /* Add a border bottom when the button is pressed (active) */
  button:active {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }

  .alert-bullet-list {
    font-style: inter, sans-serif;
    color: var(--text-ds-neutral-200);
  }

  .alert-link {
    color: var(--text-ds-primary-300);
    text-decoration: none;
    font-weight: 400;
  }

  .alert-link:hover {
    text-decoration: underline;
  }

  .external-arrow {
    font-size: 12px;
    margin-left: 2px;
    vertical-align: super;
  }

  .alert-bullet-item strong {
    font-weight: 500;
    color: var(--text-ds-neutral-50);
  }
</style>
