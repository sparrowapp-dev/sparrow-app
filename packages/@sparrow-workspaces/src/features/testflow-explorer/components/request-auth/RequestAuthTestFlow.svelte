<script lang="ts">
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "./sub-auth/index";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import type { HttpRequestCollectionLevelAuthTabInterface } from "@sparrow/common/types/workspace";
  import { CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
  import { HttpRequestAuthTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import {
    defaultAuthValue,
    httpsAuthData,
  } from "../../../../../../@sparrow-common/src/utils/testFlow.helper";

  export let auth;
  export let environmentVariables;
  export let requestStateAuth: any = {};
  export let onUpdateRequestAuth;
  export let onUpdateEnvironment;

  const onUpdateAuthType = (id = "") => {
    requestStateAuth = {
      ...requestStateAuth,
      requestAuthNavigation: id,
    };
    onUpdateRequestAuth("requestAuthNavigation", id);

    if (id === HttpRequestAuthTypeBaseEnum.NO_AUTH) {
      onUpdateRequestAuth("auth", defaultAuthValue);
    }
  };

  const onChangeRequestAuth = (data: any) => {
    if (
      requestStateAuth?.requestAuthNavigation ===
      HttpRequestAuthTypeBaseEnum.API_KEY
    ) {
      onUpdateRequestAuth("apiKey", data?.apiKey);
    } else if (
      requestStateAuth?.requestAuthNavigation ===
      HttpRequestAuthTypeBaseEnum.BASIC_AUTH
    ) {
      onUpdateRequestAuth("basicAuth", data?.basicAuth);
    } else if (
      requestStateAuth?.requestAuthNavigation ===
      HttpRequestAuthTypeBaseEnum.BEARER_TOKEN
    ) {
      onUpdateRequestAuth("bearerToken", data?.bearerToken);
    }
  };
  export let handleOpenCurrentDynamicExpression;
</script>

<div class="d-flex flex-column w-100 h-100">
  <div class="pb-2" style="font-size: 12px; font-weight:500;">
    <div class="">
      <span class="d-flex">
        <p class="mb-0">
          <WithSelect
            id={"hash999"}
            data={httpsAuthData}
            zIndex={499}
            titleId={requestStateAuth?.requestAuthNavigation ??
              HttpRequestAuthTypeBaseEnum.NO_AUTH}
            onclick={onUpdateAuthType}
            disabled={false}
          />
        </p>
      </span>
    </div>
  </div>
  <div>
    <p class="text-fs-12 fw-normal" style="color:var(--text-ds-neutral-400)">
      The auth header will be automatically generated when you send the request.
    </p>
  </div>
  <section class="w-100" style="flex:1; overflow:auto;">
    {#if requestStateAuth?.requestAuthNavigation === HttpRequestAuthTypeBaseEnum.NO_AUTH}
      <NoAuth />
    {:else if requestStateAuth?.requestAuthNavigation === HttpRequestAuthTypeBaseEnum.API_KEY}
      <ApiKey
        apiData={auth?.apiKey}
        callback={onChangeRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
        {handleOpenCurrentDynamicExpression}
      />
    {:else if requestStateAuth?.requestAuthNavigation === HttpRequestAuthTypeBaseEnum.BEARER_TOKEN}
      <BearerToken
        bearerToken={auth?.bearerToken}
        callback={onChangeRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
        {handleOpenCurrentDynamicExpression}
      />
    {:else if requestStateAuth?.requestAuthNavigation === HttpRequestAuthTypeBaseEnum.BASIC_AUTH}
      <BasicAuth
        basicAuth={auth?.basicAuth}
        callback={onChangeRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
        {handleOpenCurrentDynamicExpression}
      />
    {/if}
  </section>
</div>

<style>
</style>
