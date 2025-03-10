<script lang="ts">
  import { RequestDataTypeEnum } from "@sparrow/common/types/workspace";
  import { Input, Search } from "@sparrow/library/forms";
  import {
    BlankIcon,
    ArrowDownRegular,
    DeleteFilled,
    ListFilled,
    ArrowUpRightRegular,
    ArrowDownLeftFilled,
    CheckMarkIcon,
    CheckmarkCircleFilled,
    ErrorCircleFilled,
    CircleFilled
  } from "@sparrow/library/icons";
  import { Dropdown, Tooltip } from "@sparrow/library/ui";
  import  {ArrowUpFilled } from "@sparrow/library/icons";
  import { Select } from "@sparrow/library/forms";
  import {WithButtonV4} from "@sparrow/workspaces/hoc";

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
          webSocket.filter === "All Messages" ||
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
    try {
      const regex = new RegExp(`(${search})`, "gi");
      return text.replace(
        regex,
        `<span class="highlight-websocket-message-search">$1</span>`,
      );
    } catch (e) {}
    return text;
  };
</script>

<div class="h-100 d-flex flex-column">
  <div>
    <div class="d-flex justify-content-between align-content-center pb-2">
      <span class="text-fs-12 text-secondary-300 my-auto" style="font-weight: 600;">Response</span>
      <div class="d-flex">
        <span class="gap-1 d-flex align-items-center">
          <CircleFilled
            color={webSocket.status === "connected"
              ? "#69D696"
              : webSocket.status === "disconnected"
                ? "#CB4A4A"
                : webSocket.status === "connecting" ||
                    webSocket.status === "disconnecting"
                  ? "#FBA574"
                  : "#FBA574"}
            size={"6px"}
            
          />
          <span class="text-fs-12 px-2 connection-status"
          style={`color: ${webSocket.status === "connected"
            ? "var(--text-ds-success-300)"
            : webSocket.status === "disconnected"
              ? "var(--text-ds-danger-300)"
              : webSocket.status === "connecting" ||
                  webSocket.status === "disconnecting"
                ? "var(--text-ds-warning-300)"
                : "var(--text-ds-nuetral-300)"}`}
          >
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
        <span class="d-flex gap-1">
          <Tooltip title={"Scroll to top"}>
            <WithButtonV4
            icon={ArrowUpFilled}
            onClick={() => {
              scroll("top");
            }}
            />
          </Tooltip>
          <Tooltip title={"Scroll to bottom"}>
            <WithButtonV4
            icon={ArrowDownRegular}
            onClick={() => {
              scroll("bottom");
            }}/>
          </Tooltip>
          <Tooltip title={"Delete"} placement="bottom-right">
            <WithButtonV4
            icon={DeleteFilled}
            onClick={() => {
              onDeleteMessage();
            }}/>
          </Tooltip>
        </span>
      </div>
    </div>
    <div class="d-flex justify-content-between {webSocket?.messages?.length ? 'visible' : 'invisible'}">
      <div class="" style="max-width: 320px;">
        <Search
          id="websocket-list-search"
          customWidth={"100%"}
          variant="primary"
          size="small"
          bind:value={searchData}
          on:input={(e) => {
            onSearchMessage(searchData);
          }}
          placeholder="Search"
        />
      </div>
      <div>
        <Select
       id="filtermessage"
       titleId={`${webSocket.filter}`}
        data={[
            { id:"All Messages",
              name: "All Messages",
              icon: ListFilled,
              iconProps:{size:"16px"}
            },
            {
              id:"Sent",
              name: "Sent",
              icon: ArrowUpRightRegular,
              iconProps:{size:"16px", color:"var(--text-ds-success-300)"}
             
            },
            { id:"Received",
              name: "Received",
              icon: ArrowDownLeftFilled,
              iconProps:{size:"16px", color:"var(--text-ds-primary-400)"}
            },
          ]}
         onclick={(id)=>{
          webSocket.filter=id;
          onUpdateFilterType(id);
         }}
        minHeaderWidth={"133px"}
        borderType={"none"}
        borderActiveType={"none"}
        headerHighlight={"hover-active"}
        headerTheme={"transparent"}
        menuItem={"v2"}
        headerFontSize={"12px"}
        maxHeaderWidth={"12px"}
        zIndex={200}
        bodyTheme={"surface"}
        borderRounded={"4px"}
        position={"absolute"}
        maxBodyHeight={"108px"}
        minBodyWidth={"186px"}
        headerHeight={"28px"}
        bodyAlignment={"left"}/>
      </div>
    </div>
  </div>
  <div class="pt-1"></div>
  <div style="flex:1; overflow:auto;" bind:this={listContainer}>
    <div>
      {#each filteredWebsocketMessage as message}
        <div
          class="response-message d-flex align-items-center gap-2"
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
            class="py-2 d-flex align-items-center"
            style="padding-left:6px ;padding-right: 6px;"
          >
            {#if message?.transmitter === "sender"}
            <ArrowUpRightRegular size={"14px"} color="var(--icon-ds-success-400)"/>
                              <!-- senderIcon -->
            {:else if message?.transmitter === "disconnector"}
              <!-- DisconnectIcon -->
               <ErrorCircleFilled size={"14px"} color="var(--icon-ds-danger-400)"/>
              
            {:else if message?.transmitter === "connecter"}
              <!-- ConnectIcon -->
            
               <CheckmarkCircleFilled size={"14px"} color="var(--icon-ds-success-400)"/>
            {:else if message?.transmitter === "receiver"}
            <ArrowDownLeftFilled color="var(--icon-ds-primary-400)" size={"14px"}/>
            {/if}
          </span>
          <!-- <div class="d-flex align-items-center"> -->
          <span
            class="text-fs-12 py-2 timestamp"
            style="white-space: nowrap; line-height: 1;"
          >
            {message?.timestamp}
          </span>
          <p
            class="ellipsis text-fs-12 mb-0"
            style="line-height: 1;"
          >
            {@html highlightSearchText(message?.data, searchData)}
          </p>
          <!-- </div> -->
        </div>
      {/each}

      {#if !filteredWebsocketMessage?.length && (searchData || webSocket.filter !== "All Messages")}
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
    width: fit-content;
  }
  :global(.highlight-websocket-message-search) {
    background-color: #1e354d;
  }
  .response-message:hover {
    background-color: var(--bg-ds-surface-600);
  }
  .response-message{
    background-color: var(--bg-ds-surface-900);
    border-radius: 4px;
  }
  .connection-status {
    font-weight: 500;
    
  }
</style>
