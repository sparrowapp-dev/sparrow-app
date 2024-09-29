<script lang="ts">
  import { onDestroy } from "svelte";
  import { marked } from "marked";
  import { notifications } from "@sparrow/library/ui";
  import { copyIcon, tickIcon } from "../../assests";
  import { tick } from "svelte";

  import hljs from "highlight.js";
  import "highlight.js/styles/atom-one-dark.css";
  import {
    CopyIcon2,
    DislikeIcon,
    LikeIcon,
    RefreshIcon,
    TickIcon,
  } from "@sparrow/library/icons";
  import { SparrowAIIcon } from "@sparrow/common/icons";
  import { Tooltip } from "@sparrow/library/ui";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@deprecate/utils/enums";
  import { MessageTypeEnum } from "@sparrow/common/types/workspace";

  export let message: string;
  export let messageId: string;
  export let type;
  export let isLiked;
  export let isDisliked;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let isLastRecieverMessage;
  export let status;

  let showTickIcon: boolean = false;

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

    preElements.forEach((pre, index) => {
      if (pre) {
        // Create a new container div
        const container = document.createElement("div");
        container.className = "wrapper";
        const lang = pre.querySelector("code")?.getAttribute("class");
        hljs.highlightBlock(pre.querySelector("code"));
        // Add content or value to the container div
        container.innerHTML = `
      <div class="code-header bg-tertiary-300 ps-3 pe-2 py-1 d-flex align-items-center justify-content-between">
        <span>${lang?.split("-")[1] ?? ""}</span>
        <button role="button" class="position-relative copy-code-${messageId} action-button copy-code-selector d-flex align-items-center justify-content-center border-radius-4" id="${index}">
          <img src="${copyIcon}" id="${index}">
          <button class="copy-code-tooltip z-1 d-flex align-items-center justify-content-center position-absolute invisible text-fs-12">Copy
            <div class="copy-code-tooltip-square"></div>
          </button>
        </button>
      </div>
        `;

        pre.parentNode?.insertBefore(container, pre);
        container.appendChild(pre);
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  };

  /**
   * Handles the click event to copy code from a specified wrapper to the clipboard.
   *
   * @param event - The mouse event triggered by clicking on the wrapper.
   */
  const handleCopyCode = async (event: MouseEvent) => {
    const id = (event.target as HTMLElement).id;
    const targetElement = event.target as
      | HTMLImageElement
      | HTMLButtonElement
      | any;
    const firstChild = targetElement.children[0];
    const tagName = targetElement.tagName;
    if (tagName === "IMG") {
      const originalSrc = targetElement?.src;
      targetElement.src = tickIcon;
      targetElement.classList.add("tick-icon");
      setTimeout(() => {
        targetElement.src = originalSrc;
        targetElement.classList.remove("tick-icon");
      }, 5000);
    }
    if (tagName === "BUTTON" && firstChild) {
      const originalSrc = firstChild?.src;
      firstChild.src = tickIcon;
      firstChild.classList.add("tick-icon");
      setTimeout(() => {
        firstChild.src = originalSrc;
        firstChild.classList.remove("tick-icon");
      }, 5000);
    }
    const target = (event.target as HTMLElement).closest(
      ".wrapper",
    ) as HTMLElement | null;
    if (target) {
      const codeElement = target.querySelector(
        "pre code",
      ) as HTMLElement | null;
      if (codeElement) {
        const code = codeElement.textContent || "";
        try {
          await navigator.clipboard.writeText(code);
          notifications.success("Code copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy code: ", err);
        }
      }
    }
  };

  /**
   * Handles the response copy to clipboard functionality.
   */
  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(message);
      notifications.success("Response copied to clipboard!");
      showTickIcon = true;
      await tick();
      setTimeout(() => {
        showTickIcon = false;
      }, 5000);
      MixpanelEvent(Events.AI_Copy_Response);
    } catch (err) {
      console.error("Failed to copy response: ", err);
    }
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
  <!--
    -- 
    -- SENDER
    -- 
    -->
  {#if type === MessageTypeEnum.SENDER}
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
          <Tooltip placement="top" title="Regenerate" distance={13}>
            <button
              class="action-button d-flex align-items-center justify-content-center border-radius-4"
              on:click={regenerateAiResponse}
            >
              <RefreshIcon height={"16px"} width={"16px"} />
            </button>
          </Tooltip>
        {/if}
        <Tooltip
          placement="top"
          title={showTickIcon ? "Copied" : "Copy"}
          distance={13}
        >
          <button
            disabled={showTickIcon}
            class="action-button d-flex align-items-center justify-content-center border-radius-4"
            on:click={handleCopyResponse}
          >
            {#if showTickIcon}
              <TickIcon height={"14px"} width={"14px"} color={"grey"} />
            {:else}
              <CopyIcon2 height={"14px"} width={"14px"} />
            {/if}
          </button>
        </Tooltip>
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
    background-color: transparent;
    box-shadow: none;
    border: none;
    width: 30px;
  }
  :global(.action-button:hover) {
    background-color: var(--bg-tertiary-190);
  }

  button:disabled {
    background-color: inherit;
  }

  .error-message {
    background-color: var(--bg-danger-1200);
    border: 0.2px solid var(--border-danger-200);
  }

  :global(.tick-icon) {
    height: 16px;
  }

  :global(.copy-code-tooltip) {
    transition: 0.3s ease;
    font-weight: 400;
    gap: 6px;
    top: 40px;
    border-radius: 2px;
    left: 50%;
    transform: translateX(-50%);
    position: absolute;
    padding: 4px 8px;
    background-color: var(--bg-tertiary-700);
    opacity: 0;
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  }
  :global(.copy-code-tooltip-square) {
    z-index: 0;
    position: absolute;
    top: -5px;
    left: 50%;
    border-radius: 2px;
    height: 10px;
    width: 10px;
    background-color: var(--bg-tertiary-700);
    transform: translateX(-38%) rotate(45deg); /* Rotate 45 degrees */
  }
  :global(.copy-code-selector:hover .copy-code-tooltip) {
    visibility: visible !important;
    opacity: 1;
  }
</style>
