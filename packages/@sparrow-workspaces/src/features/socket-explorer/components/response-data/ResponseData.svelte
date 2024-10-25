<script lang="ts">
  import { RequestDataTypeEnum } from "@sparrow/common/types/workspace";
  import { Input } from "@sparrow/library/forms";
  import {
    ArrowInsertIcon,
    ArrowOutwardIcon,
    ErrorInfoIcon,
    SuccessInfoIcon,
    DotIcon,
    DustbinIcon,
    ArrowUpward,
    ArrowDownward,
    DownArrowIcon,
    BlankIcon,
  } from "@sparrow/library/icons";
  import { Dropdown, Tooltip } from "@sparrow/library/ui";
  import { WithButtonV4 } from "@sparrow/workspaces/hoc";

  export let webSocket;
  export let onSearchMessage;
  export let onDeleteMessage;
  export let onUpdateMessageBody;
  export let onUpdateContentType;
  export let onUpdateFilterType;
  let searchData = webSocket.search;

  let filteredWebsocketMessage = [];
  const filterWebsocketResponse = () => {
    filteredWebsocketMessage = webSocket.messages
      .filter((message) => {
        if (message.data.toLowerCase().includes(searchData.toLowerCase())) {
          return true;
        }
        return false;
      })
      .filter((message) => {
        if (
          webSocket.filter === "All messages" ||
          (message.transmitter === "sender" && webSocket.filter === "Sent") ||
          (message.transmitter === "receiver" &&
            webSocket.filter === "Received")
        ) {
          return true;
        }
        return false;
      });
  };
  $: {
    if (webSocket) {
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

  let isFilterDropdownActive = false;

  /**
   * @description - Highlights the searched text
   * @param text - The text to be highlighted
   * @param search - The search term
   * @returns - The HTML string with highlighted text
   */
  const highlightSearchText = (text: string, search: string): string => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.replace(
      regex,
      `<span class="highlight-websocket-message-search">$1</span>`,
    );
  };
</script>

<div class="h-100 d-flex flex-column">
  <div>
    <div class="d-flex justify-content-between py-2">
      <span class="text-fs-12 text-secondary-300">Response</span>
      <div class="d-flex">
        <span class="">
          <DotIcon
            color={webSocket.status === "connected"
              ? "#69D696"
              : webSocket.status === "disconnected"
                ? "#CB4A4A"
                : webSocket.status === "connecting" ||
                    webSocket.status === "disconnecting"
                  ? "#FBA574"
                  : "#FBA574"}
            height={"8px"}
            width={"8px"}
          />
          <span class="text-fs-12 px-2">
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
        <span class="d-flex">
          <Tooltip title={"Scroll to top"}>
            <WithButtonV4
              icon={ArrowUpward}
              onClick={() => {
                scroll("top");
              }}
              disable={false}
              loader={false}
            />
          </Tooltip>
          <Tooltip title={"Scroll to bottom"}>
            <WithButtonV4
              icon={ArrowDownward}
              onClick={() => {
                scroll("bottom");
              }}
              disable={false}
              loader={false}
            />
          </Tooltip>
          <Tooltip title={"Delete"}>
            <WithButtonV4
              icon={DustbinIcon}
              onClick={() => {
                onDeleteMessage();
              }}
              disable={false}
              loader={false}
            />
          </Tooltip>
        </span>
      </div>
    </div>
    <div class="d-flex {webSocket?.messages?.length ? 'visible' : 'invisible'}">
      <div class="w-100" style="margin-right:60px;">
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
      <div>
        <Dropdown
          buttonId="filtermessage"
          bind:isMenuOpen={isFilterDropdownActive}
          horizontalPosition="left"
          minWidth={175}
          options={[
            {
              name: "All messages",
              icon: BlankIcon,
              iconColor: "",
              iconSize: "13px",
              color: "var(--text-secondary-100)",
              onclick: () => {
                onUpdateFilterType("All messages");
              },
            },
            {
              name: "Sent",
              icon: ArrowOutwardIcon,
              iconColor: "#69D696",
              iconSize: "13px",
              color: "var(--text-secondary-100)",
              onclick: () => {
                onUpdateFilterType("Sent");
              },
            },
            {
              name: "Received",
              icon: ArrowInsertIcon,
              iconColor: "#0B5ED7",
              iconSize: "13px",
              color: "var(--text-secondary-100)",
              onclick: () => {
                onUpdateFilterType("Received");
              },
            },
          ]}
        >
          <button
            id="filtermessage"
            class="h-100 border-0 bg-transparent py-2 rounded d-flex justify-content-end align-items-center"
            style="width:130px;"
            on:click={() => {
              isFilterDropdownActive = !isFilterDropdownActive;
            }}
          >
            <span class="text-fs-12 pe-2 text-tertiary-100">Filter Message</span
            >
            <DownArrowIcon
              height={"16px"}
              width={"16px"}
              color={"var(--text-tertiary-100)"}
            />
          </button>
          <!-- </Tooltip> -->
        </Dropdown>
      </div>
    </div>
  </div>
  <div class="pt-2"></div>
  <div style="flex:1; overflow:auto;" bind:this={listContainer}>
    <div>
      {#each filteredWebsocketMessage as message}
        <div
          class="response-message d-flex align-items-center"
          style="cursor: pointer;"
          on:click={() => {
            onUpdateMessageBody(message.uuid);

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
          <span
            class="p-2 d-flex align-items-center"
            style="width: 35px !important;"
          >
            {#if message?.transmitter === "sender"}
              <ArrowOutwardIcon
                height={"10px"}
                width={"10px"}
                color={"#69D696"}
              />
              <!-- senderIcon -->
            {:else if message?.transmitter === "disconnector"}
              <!-- DisconnectIcon -->
              <ErrorInfoIcon height={"12px"} width={"12px"} color={"#FE8C98"} />
            {:else if message?.transmitter === "connecter"}
              <!-- ConnectIcon -->
              <SuccessInfoIcon
                height={"14px"}
                width={"14px"}
                color={"#69D696"}
              />
            {:else if message?.transmitter === "receiver"}
              <ArrowInsertIcon
                height={"10px"}
                width={"10px"}
                color={"#0B5ED7"}
              />
            {/if}
          </span>
          <!-- <div class="d-flex align-items-center"> -->
          <span
            class="text-fs-12 py-2 px-3 timestamp"
            style="white-space: nowrap; line-height: 1;"
          >
            {message?.timestamp}
          </span>
          <p
            class="ellipsis text-fs-12 mb-0"
            style="margin-left: 8px; line-height: 1; width: calc(100% - 145px);"
          >
            {@html highlightSearchText(message?.data, searchData)}
          </p>
          <!-- </div> -->
        </div>
      {/each}

      {#if !filteredWebsocketMessage?.length && (searchData || webSocket.filter !== "All messages")}
        <p class="text-fs-16 text-center text-secondary-200">
          No result found.
        </p>
      {/if}
    </div>
  </div>
  <div class="pt-2"></div>
</div>

<style>
  .timestamp {
    color: var(--text-secondary-550);
    width: 110px;
  }
  :global(.highlight-websocket-message-search) {
    background-color: #1e354d;
  }
  .response-message:hover {
    background-color: #2e2f3d;
  }
</style>
