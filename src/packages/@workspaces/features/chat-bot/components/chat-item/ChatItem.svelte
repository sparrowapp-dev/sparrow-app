<script lang="ts">
  import { onDestroy } from "svelte";
  import { marked } from "marked";
  import { notifications } from "@library/ui/toast/Toast";
  import { copyIcon } from "../../assests";

  import hljs from "highlight.js";
  import "highlight.js/styles/atom-one-dark.css";
  import {
    CopyIcon2,
    DislikeIcon,
    LikeIcon,
    RefreshIcon,
  } from "@library/icons";
  import { SparrowAIIcon } from "@common/icons";
  import { Tooltip } from "@library/ui";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums";
  import { MessageTypeEnum } from "@common/types/workspace";

  export let message: string;
  export let messageId;
  export let type;
  export let isLiked;
  export let isDisliked;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let isLastRecieverMessage;
  export let status;

  /**
   * Decodes an HTML string by parsing it, processing <pre><code> elements, and wrapping them
   * in custom containers with additional copy paste functionality.
   *
   * @param htmlString - The HTML string to decode and process.
   * @returns The processed HTML string.
   */

  const decodeMessage = (htmlString: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Select all <pre> elements
    const codeElements = doc.querySelectorAll("pre > code");
    const preElements = Array.from(codeElements)
      .filter((elem) => {
        if (elem.innerHTML.trim()) return true;
        return false;
      })
      .map((codeElem) => codeElem.parentElement);

    // Iterate over each <pre> element
    preElements.forEach((pre) => {
      if (pre) {
        // Create a new container div
        const container = document.createElement("div");
        container.className = "wrapper";
        const lang = pre.querySelector("code")?.getAttribute("class");
        hljs.highlightBlock(pre.querySelector("code"));
        // Add content or value to the container div
        container.innerHTML = `
      <div class="code-header bg-tertiary-300 ps-3 pe-2 py-1 d-flex align-items-center justify-content-between"
      
      style="">
        <span>${lang?.split("-")[1] ?? ""}</span>
        <span role="button" class="copy-code-${messageId} action-button d-flex align-items-center justify-content-center border-radius-4">
        <img src=${copyIcon}>
        </span>
      </div>
        `;

        // Move the <pre> element into the new container
        pre.parentNode?.insertBefore(container, pre);
        container.appendChild(pre);
      }
    });

    // Serialize the DOM back into a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  };

  /**
   * Handles the click event to copy code from a specified wrapper to the clipboard.
   *
   * @param event - The mouse event triggered by clicking on the wrapper.
   */
  const handleCopyCode = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest(
      ".wrapper",
    ) as HTMLElement | null;
    if (target) {
      const codeElement = target.querySelector(
        "pre code",
      ) as HTMLElement | null;
      if (codeElement) {
        const code = codeElement.textContent || "";
        navigator.clipboard
          .writeText(code)
          .then(() => {
            notifications.success("Code copied to clipboard!");
          })
          .catch((err) => {
            console.error("Failed to copy code: ", err);
          });
      }
    }
  };

  /**
   * Handles the response copy to clipboard functionality.
   */
  const handleCopyResponse = () => {
    const response = message;
    navigator.clipboard
      .writeText(response)
      .then(() => {
        notifications.success("Response copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err);
      });
    MixpanelEvent(Events.AI_Copy_Response);
  };

  let cleanUpListeners: () => void = () => {};

  let extractedMessage = "";

  /**
   * Embeds click listeners to copy code from dynamically inserted wrappers.
   * @returns A promise that resolves when the listeners are embedded.
   */
  const embedListenerToCopyCode = async () => {
    extractedMessage = decodeMessage(await marked(message));
    // Add event listeners to all dynamically inserted wrappers

    setTimeout(() => {
      const wrappers = document.querySelectorAll(`.copy-code-${messageId}`);

      // Remove previous event listeners
      cleanUpListeners();

      cleanUpListeners = () => {
        wrappers.forEach((wrapper) => {
          wrapper.removeEventListener("click", handleCopyCode);
        });
      };
      wrappers.forEach((wrapper) => {
        wrapper.addEventListener("click", handleCopyCode);
      });
    }, 200);
  };

  /**
   * Reactive statement to embed listeners for copying code when the message changes.
   */
  $: {
    if (message) {
      embedListenerToCopyCode();
    }
  }

  /**
   * Cleanup function to remove event listeners when the component is destroyed.
   */
  onDestroy(() => {
    // Clean up event listeners to destroy copy code element
    if (cleanUpListeners) {
      cleanUpListeners();
    }
  });
</script>

<div class="message-wrapper">
  {#if type === MessageTypeEnum.SENDER}
    <!--
    -- 
    -- SENDER
    -- 
    -->
    <div class="send-item">
      <p class="my-4 px-3 text-fs-12">{@html message}</p>
    </div>
  {:else}
    <!--
    -- 
    -- RECIEVER
    -- 
    -->
    <div class="recieve-item p-3">
      <div class="d-flex justify-content-between">
        <SparrowAIIcon height={"20px"} width={"20px"} />
        <div class="d-flex gap-1 pb-2">
          {#if status}
            <!--
            -- 
            -- LIKE / DISLIKE
            -- 
            -->
            <Tooltip placement="top" title="Like" distance={13}>
              <span
                role="button"
                class="action-button d-flex align-items-center justify-content-center border-radius-4"
                on:click={() => {
                  onToggleLike(messageId, true);
                  MixpanelEvent(Events.AI_Like_Response);
                }}
              >
                <LikeIcon
                  height={"16px"}
                  width={"16px"}
                  color={isLiked ? "white" : "transparent"}
                />
              </span>
            </Tooltip>
            <Tooltip placement="top" title="Dislike" distance={13}>
              <span
                class="action-button d-flex align-items-center justify-content-center border-radius-4"
                role="button"
                on:click={() => {
                  onToggleLike(messageId, false);
                  MixpanelEvent(Events.AI_Dislike_Response);
                }}
              >
                <DislikeIcon
                  height={"16px"}
                  width={"16px"}
                  color={isDisliked ? "white" : "transparent"}
                />
              </span>
            </Tooltip>
          {/if}
        </div>
      </div>
      {#if status}
        <div class="markdown">
          {@html extractedMessage}
        </div>
      {:else}
        <div class="markdown error-message p-2 border-radius-4 mb-2 mt-3">
          <p class="mb-0">{message}</p>
        </div>
      {/if}
      <div class="d-flex gap-1">
        <!--
        -- 
        -- REGENERATE / COPY
        -- 
        -->
        {#if isLastRecieverMessage}
          <span
            role="button"
            class="action-button d-flex align-items-center justify-content-center border-radius-4"
            on:click={() => {
              regenerateAiResponse();
            }}
          >
            <RefreshIcon height={"16px"} width={"16px"} />
          </span>
        {/if}
        <span
          role="button"
          class="action-button d-flex align-items-center justify-content-center border-radius-4"
          on:click={() => {
            handleCopyResponse();
          }}
        >
          <CopyIcon2 height={"14px"} width={"14px"} />
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
  .send-item,
  .recieve-item {
    border-bottom: 1px solid var(--border-secondary-320);
  }

  :global(
      .message-wrapper .markdown p,
      .message-wrapper .markdown li,
      .message-wrapper .markdown a,
      .message-wrapper .markdown span,
      .message-wrapper .markdown code
    ) {
    font-size: 12px;
  }
  :global(.message-wrapper .markdown pre) {
    margin-bottom: 0;
  }

  :global(.message-wrapper .wrapper) {
    border-radius: 4px !important;
    overflow: hidden !important;
    margin-bottom: 10px;
  }
  :global(.message-wrapper .hljs) {
    background: #000 !important;
  }
  :global(.action-button) {
    height: 30px;
    width: 30px;
  }
  :global(.action-button:hover) {
    background-color: var(--bg-tertiary-190);
  }
  .error-message {
    background-color: var(--bg-danger-1200);
    border: 0.2px solid var(--border-danger-200);
  }
</style>
