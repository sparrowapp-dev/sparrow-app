<script lang="ts">
  import {
    AddRegular,
    ChevronLeftRegular,
    ChevronRightRegular,
  } from "@sparrow/library/icons";
  import { Accordion, Button } from "@sparrow/library/ui";
  export let requestApis: any = [];
  export let environmentVariables: any;
  export let handleSelectApi: (data: any) => void;
  export let handleSelectVariable: (requestVariable: any) => void;
  export let handleSelectRequestType: (
    requestData: any,
    type: string,
    label: string,
    blockName: string,
  ) => void;
  export let handleRemoveSelectApi: () => void;
  export let selectedRequest: any;
  const requestTypes = [
    {
      requestType: "response.body",
      label: "response.body",
    },
    {
      requestType: "response.header",
      label: "response.header",
    },
    {
      requestType: "body",
      label: "request.body",
    },
    {
      requestType: "headers",
      label: "request.header",
    },
    {
      requestType: "queryParams",
      label: "request.parameters",
    },
  ];
</script>

<div>
  <Accordion position="right">
    <div class="d-flex align-items-center" slot="accordion-field">
      {#if selectedRequest}
        <div
          class="d-flex justify-conten-start align-items-center"
          style="gap: 6px;"
        >
          <Button
            type="teritiary-regular"
            size="small"
            iconSize={16}
            startIcon={ChevronLeftRegular}
            onClick={handleRemoveSelectApi}
          />
          <div
            class="d-flex flex-row align-items-center justify-content-start"
            style="gap: 6px;"
          >
            <p style="margin: 0px;" class="request-block-method">
              {selectedRequest?.requestData?.method}
            </p>
            <p style="margin: 0px;" class="request-block-name text-center">
              {selectedRequest?.blockName}
            </p>
          </div>
        </div>
      {:else}
        <p style="margin:0px;">Previous API Request</p>
      {/if}
    </div>
    <div
      class=""
      slot="accordion-content"
      style="padding: 4px 8px; height: 146px; overflow-y: auto"
    >
      {#if selectedRequest}
        <div class="" style="gap: 2px;">
          {#each requestTypes as type}
            <div
              class="d-flex flex-row justify-content-between align-items-start request-type-block"
              style="height:28px; border-radius:4px; padding:5px 8px; cursor: pointer;"
              on:click={() => {
                handleSelectRequestType(
                  selectedRequest?.requestData,
                  type.requestType,
                  type.label,
                  selectedRequest?.blockName,
                );
              }}
            >
              <div class="d-flex justify-content-start align-items-center">
                <p style="margin: 0px;" class="">
                  {type.label}
                </p>
              </div>
              <AddRegular size="16px" color={"var(--icon-ds-neutral-50)"} />
            </div>
          {/each}
        </div>
      {:else}
        {#each requestApis as requestApi, index}
          {#if index !== 0}
            <div
              class="d-flex flex-row justify-content-between align-items-center request-api-block"
              style="height:28px; border-radius:4px; padding:5px 8px; cursor: pointer;"
              on:click={() => {
                handleSelectApi(requestApi?.data);
              }}
            >
              <div
                class="d-flex justify-content-start align-items-center"
                style="gap:8px;"
              >
                <p style="margin: 0px;" class="request-block-method">
                  {requestApi?.data?.requestData?.method}
                </p>
                <p style="margin: 0px;" class="request-block-name text-center">
                  {requestApi?.data?.blockName}
                </p>
              </div>
              <Button
                type="teritiary-regular"
                size="extra-small"
                startIcon={ChevronRightRegular}
                onClick={() => {
                  handleSelectApi(requestApi?.data);
                }}
              />
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </Accordion>
  <Accordion position="right">
    <div class="d-flex align-items-center" slot="accordion-field">
      <p style="margin:0px;">Variables</p>
    </div>
    <div
      slot="accordion-content"
      style="padding: 4px 8px; height: 146px; overflow-y: auto"
    >
      <p class="fw-semibold mb-1" style="font-size: 12px;">Dev Environment</p>

      {#each environmentVariables.filtered as variable (variable.key)}
        {#if variable?.environment !== "Global Variables"}
          <div
            class="d-flex justify-content-between align-items-center px-2 py-1 mb-1 request-type-block"
            style="height: 28px; border-radius: 4px; cursor: pointer;"
            on:click={() => {
              handleSelectVariable(variable);
            }}
          >
            <span style="font-size: 12px;">{variable?.key}</span>
            <AddRegular size="16px" color="var(--icon-ds-neutral-50)" />
          </div>
        {/if}
      {/each}

      <p class="fw-semibold mt-2 mb-1" style="font-size: 12px;">
        Global Environments
      </p>

      {#each environmentVariables.filtered as variable (variable.key)}
        {#if variable?.environment === "Global Variables"}
          <div
            class="d-flex justify-content-between align-items-center px-2 py-1 mb-1 request-type-block"
            style="height: 28px; border-radius: 4px; cursor: pointer;"
            on:click={() => {
              handleSelectVariable(variable);
            }}
          >
            <span style="font-size: 12px;">{variable?.key}</span>
            <AddRegular size="16px" color="var(--icon-ds-neutral-50)" />
          </div>
        {/if}
      {/each}
    </div>
  </Accordion>
</div>

<style>
  .request-block-name {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 143%;
    letter-spacing: 0;
  }
  .request-block-method {
    font-family: "Roboto", sans-serif;
    font-weight: 700;
    font-size: 12px;
    line-height: 1;
    letter-spacing: normal;
    font-variant: small-caps;
  }
  .request-api-block:hover {
    background-color: var(--bg-ds-surface-400);
  }
  .request-type-block:hover {
    background-color: var(--bg-ds-surface-400);
  }
  .request-type-block {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 130%;
    letter-spacing: 0%;
    color: var(--bg-ds-neutral-50);
  }
</style>
