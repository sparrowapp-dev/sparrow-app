<script lang="ts">
  import { RequestDataTypeEnum } from "@common/types/workspace";
  import { Input } from "@library/forms";
  import {
    ArrowInsertIcon,
    ArrowOutwardIcon,
    ErrorInfoIcon,
    SuccessInfoIcon,
    DotIcon,
    DustbinIcon,
    ArrowUpward,
    ArrowDownward,
  } from "@library/icons";

  export let webSocket;
  export let onSearchMessage;
  export let onDeleteMessage;
  export let onUpdateMessageBody;
  export let onUpdateContentType;
  let searchData = webSocket.search;

  let filteredWebsocketMessage = [];
  const filterWebsocketResponse = () => {
    filteredWebsocketMessage = webSocket.messages.filter((messages) => {
      if (messages.data.includes(searchData)) return true;
      return false;
    });
  };
  $: {
    if (searchData !== undefined || searchData !== null || webSocket) {
      filterWebsocketResponse();
    }
  }

  /**
   *  list container wrapper
   */
  let listContainer: HTMLElement;

  /**
   * @description - scrolls the list container to top or bottom
   * @param position - decides the direction to scroll
   */
  const scroll = (position: "top" | "bottom") => {
    if (position === "bottom") {
      listContainer.scrollTo({
        top: listContainer.scrollHeight,
        behavior: "auto",
      });
    } else if (position === "top") {
      listContainer.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }
  };
</script>

<div class="h-100 d-flex flex-column">
  <div>
    <div class="d-flex justify-content-between py-2">
      <span class="text-fs-12 text-secondary-200">Response</span>
      <div>
        <span>
          <DotIcon
            color={webSocket.status === "connected"
              ? "green"
              : webSocket.status === "disconnected"
              ? "red"
              : webSocket.status === "connecting" ||
                webSocket.status === "disconnecting"
              ? "yellow"
              : "yellow"}
          />
          <span class="text-fs-12">
            {webSocket.status === "connected"
              ? "Connected"
              : webSocket.status === "disconnected"
              ? "Disconnected"
              : webSocket.status === "connecting"
              ? "Connecting"
              : webSocket.status === "disconnecting"
              ? "Disconnecting"
              : ""}
          </span>
        </span>
        <span>
          <span
            role="button"
            on:click={() => {
              scroll("top");
            }}
          >
            <ArrowUpward height={"12px"} width={"12px"} color={"grey"} />
          </span>
          <span
            role="button"
            on:click={() => {
              scroll("bottom");
            }}
          >
            <ArrowDownward height={"12px"} width={"12px"} color={"grey"} />
          </span>
          <span on:click={onDeleteMessage} role="button">
            <DustbinIcon height={"12px"} width={"12px"} color={"grey"} />
          </span>
        </span>
      </div>
    </div>
    <div>
      <Input
        id="websocket-list-search"
        width={"100%"}
        height={"33px"}
        type="search"
        bind:value={searchData}
        on:input={(e) => {
          onSearchMessage(searchData);
        }}
        defaultBorderColor="transparent"
        hoveredBorderColor="var(--border-primary-300)"
        focusedBorderColor={"var(--border-primary-300)"}
        class="text-fs-12 bg-tertiary-400 border-radius-2 ellipsis fw-normal px-2"
        style="outline:none;"
        placeholder="Search"
      />
    </div>
  </div>
  <div class="pt-2"></div>
  <div style="flex:1; overflow:auto;" bind:this={listContainer}>
    <div>
      {#each filteredWebsocketMessage as message}
        <div
          class="d-flex"
          on:click={() => {
            onUpdateMessageBody(message.data);
            try {
              if (message.data) {
                JSON.parse(message.data);
                onUpdateContentType(RequestDataTypeEnum.JSON);
              }
            } catch (e) {
              onUpdateContentType(RequestDataTypeEnum.TEXT);
            }
          }}
        >
          <span class="p-2 d-flex align-items-center" style="width:24px;">
            {#if message?.transmitter === "sender"}
              <ArrowOutwardIcon
                height={"10px"}
                width={"10px"}
                color={"green"}
              />
              <!-- senderIcon -->
            {:else if message?.transmitter === "disconnector"}
              <!-- DisconnectIcon -->
              <ErrorInfoIcon
                height={"12px"}
                width={"12px"}
                color={"var(--dangerColor)"}
              />
            {:else if message?.transmitter === "connecter"}
              <!-- ConnectIcon -->
              <SuccessInfoIcon height={"14px"} width={"14px"} color={"green"} />
            {:else if message?.transmitter === "receiver"}
              <!-- RecieveIcon -->
              <ArrowInsertIcon height={"10px"} width={"10px"} color={"blue"} />
            {/if}
          </span>
          <span class="text-fs-12 py-2 pe-2 text-secondary-200">
            {message?.timestamp}
          </span>
          <p class="ellipsis py-2 text-fs-12 mb-0">{message?.data}</p>
        </div>
      {/each}
      {#if !filteredWebsocketMessage?.length && searchData}
        <span class="text-fs-16"> No results found. </span>
      {/if}
    </div>
  </div>
  <div class="pt-2"></div>
</div>
