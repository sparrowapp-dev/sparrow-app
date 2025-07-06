<script lang="ts">
  import {
    ApiKey,
    AuthProfile,
    BasicAuth,
    BearerToken,
    NoAuth,
  } from "./sub-auth";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import type { HttpRequestCollectionLevelAuthTabInterface } from "@sparrow/common/types/workspace";
  import { CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
  import { HttpRequestAuthTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import { Button } from "@sparrow/library/ui";
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
  export let requestStateAuthProfile;

  const handlecollection_restapi_auth_changed = ({
    requestAuthNavigation,
  }: {
    requestAuthNavigation: string;
  }) => {
    captureEvent("restapi_auth_changed", {
      component: "RequestAuth",
      button_text: requestAuthNavigation,
      destination: requestAuthNavigation,
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
              {
                name: "Inherit Auth",
                id: HttpRequestAuthTypeBaseEnum.INHERIT_AUTH,
                disabled: true,
                hide: true,
              },
              {
                name: "API Key",
                id: HttpRequestAuthTypeBaseEnum.API_KEY,
              },
              {
                name: "Bearer Token",
                id: HttpRequestAuthTypeBaseEnum.BEARER_TOKEN,
              },
              {
                name: "Basic Auth",
                id: HttpRequestAuthTypeBaseEnum.BASIC_AUTH,
              },
              {
                name: "Auth Profiles",
                id: HttpRequestAuthTypeBaseEnum.AUTH_PROFILES,
                disabled: !collection?.auth?.length,
              },
            ]}
            zIndex={499}
            titleId={requestStateAuth}
            onclick={(id = "") => {
              onUpdateRequestState({ requestAuthNavigation: id });
              handlecollection_restapi_auth_changed({
                requestAuthNavigation: id,
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
      The auth header will be automatically generated when you send the request.
    </p>
  </div>
  <section class="w-100" style="flex:1; overflow:hidden;">
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
    {:else if requestStateAuth === HttpRequestAuthTypeBaseEnum.AUTH_PROFILES}
      <AuthProfile
        currSelectedAuthProfileId={requestStateAuthProfile}
        callback={onUpdateRequestState}
        authProfilesList={collection?.auth}
      />
      {#if collection}
        <p
          class="text-fs-12 mb-1"
          style="color:var(--text-ds-neutral-400); max-width:600px;"
        >
          The authorization profile is inherited from the collection '<span
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
</style>
