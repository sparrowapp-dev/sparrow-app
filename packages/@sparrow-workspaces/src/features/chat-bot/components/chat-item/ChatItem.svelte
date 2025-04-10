<script lang="ts">
  import { onDestroy } from "svelte";
  import { marked } from "marked";
  import { notifications } from "@sparrow/library/ui";
  import { copyIcon, tickIcon, ArrowExpand } from "../../assests";
  import { tick } from "svelte";

  import hljs from "highlight.js";
  import "highlight.js/styles/atom-one-dark.css";
  import { TickIcon } from "@sparrow/library/icons";
  import { SparrowAIIcon } from "@sparrow/common/icons";
  import { Tooltip } from "@sparrow/library/ui";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import { MessageTypeEnum } from "@sparrow/common/types/workspace";
  import { ArrowSyncRegular, ThumbLikeRegular } from "@sparrow/library/icons";
  import {
    ThumbLikeFilled,
    ThumbDislikeFilled,
    CopyRegular,
    ThumbDislikeRegular,
  } from "@sparrow/library/icons";
  export let message: string;
  export let messageId: string;
  export let type;
  export let isLiked;
  export let isDisliked;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let isLastRecieverMessage;
  export let status;

  export let onClickCodeBlockPreview;

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
        // Adding code block action buttons like copy code and preview code
        container.innerHTML = `
            <div class="code-header d-flex align-items-center justify-content-between">
              <button role="button" class="position-relative preview-code-${messageId} action-button codeBlock-action-btns-selector d-flex align-items-center justify-content-center border-radius-4" id="${index}">
                <img src="${ArrowExpand}" id="${index}">
                <div class="codeBlock-action-btns-tooltip">Preview
                  <div class="codeBlock-action-btns-tooltip-square"></div>
                </div>
              </button>
              <button role="button" class="position-relative copy-code-${messageId} action-button codeBlock-action-btns-selector d-flex align-items-center justify-content-center border-radius-4" id="${index}">
                <img src="${copyIcon}" id="${index}">
                <div class="codeBlock-action-btns-tooltip">Copy
                  <div class="codeBlock-action-btns-tooltip-square"></div>
                </div>
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
    const targetElement = event.target as
      | HTMLImageElement
      | HTMLButtonElement
      | any;
    const firstChild = targetElement.children[0];

    // Prevent click if tick icon is already shown
    if (
      targetElement.classList.contains("tick-icon") ||
      firstChild?.classList?.contains("tick-icon")
    ) {
      return;
    }

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
          notifications.success("Code copied to clipboard.");
        } catch (err) {
          console.error("Failed to copy code: ", err);
        }
      }
    }
  };

  /**
   * Handles the click event to preview code from a specified wrapper to the modal popup.
   *
   * @param event - The mouse event triggered by clicking on the wrapper.
   */
  const handleCodePreview = async (event: MouseEvent) => {
    const wrapper = (event.target as HTMLElement).closest(
      ".wrapper",
    ) as HTMLElement | null;

    if (!wrapper) return;

    const preElement = wrapper.querySelector("pre > code")
      ?.parentElement as HTMLPreElement | null;

    if (preElement) {
      onClickCodeBlockPreview(preElement);
    }
  };

  /**
   * Handles the response copy to clipboard functionality.
   */
  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(message);
      notifications.success("Response copied to clipboard.");
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
      const copyCodeBtns = document.querySelectorAll(`.copy-code-${messageId}`);
      const previewCodeBtns = document.querySelectorAll(
        `.preview-code-${messageId}`,
      );

      // Remove previous event listeners
      cleanUpListeners();

      cleanUpListeners = () => {
        copyCodeBtns.forEach((wrapper) => {
          wrapper.removeEventListener("click", handleCopyCode);
        });
      };
      copyCodeBtns.forEach((wrapper) => {
        wrapper.addEventListener("click", handleCopyCode);
      });

      cleanUpListeners = () => {
        previewCodeBtns.forEach((wrapper) => {
          wrapper.removeEventListener("click", handleCodePreview);
        });
      };
      previewCodeBtns.forEach((wrapper) => {
        wrapper.addEventListener("click", handleCodePreview);
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
      <p
        class="my-4 px-3 text-fs-12"
        style="background-color: var(--bg-ds-surface-500); 
        height: auto; 
        width:fit-content;
        border-radius: 8px; 
        padding: 8px; 
        margin-left: auto; 
        margin-right: 5px; 
        max-width: 248px; 
        text-align: left;
        font-size:12px;
        weight:400;
        gap:10px;
        "
      >
        {@html message}
      </p>
    </div>
  {:else}
    <!--
    -- 
    -- RECIEVER
    -- 
    -->
    <div class="recieve-item p-2">
      <div class="d-flex justify-content-between">
        <div class="d-flex gap-1 pb-2">
          {#if status}
            <!--
            -- 
            -- LIKE / DISLIKE
            -- 
            -->
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
          <Tooltip
            placement="top-center"
            title={showTickIcon ? "Copied" : "Copy"}
            distance={13}
          >
            <button
              disabled={showTickIcon}
              class="action-button d-flex align-items-center justify-content-center border-radius-4"
              on:click={handleCopyResponse}
            >
              {#if showTickIcon}
                <TickIcon size={"14px"} color={"grey"} />
              {:else}
                <CopyRegular size={"16px"} />
              {/if}
            </button>
          </Tooltip>
          <Tooltip placement="top-center" title="Like" distance={13}>
            <span
              role="button"
              class="action-button d-flex align-items-center justify-content-center border-radius-4"
              on:click={() => {
                onToggleLike(messageId, true);
                MixpanelEvent(Events.AI_Like_Response);
              }}
            >
              {#if isLiked}
                <ThumbLikeFilled size={"16px"} />
              {:else}
                <ThumbLikeRegular size={"16px"} />
              {/if}
            </span>
          </Tooltip>
          <Tooltip placement="top-center" title="Dislike" distance={13}>
            <span
              class="action-button d-flex align-items-center justify-content-center border-radius-4"
              role="button"
              on:click={() => {
                onToggleLike(messageId, false);
                MixpanelEvent(Events.AI_Dislike_Response);
              }}
            >
              {#if isDisliked}
                <ThumbDislikeFilled size={"16px"} />
              {:else}
                <ThumbDislikeRegular size={"16px"} />
              {/if}
            </span>
          </Tooltip>
          <Tooltip placement="top-center" title="Regenerate" distance={13}>
            <button
              class="action-button d-flex align-items-center justify-content-center border-radius-4"
              on:click={regenerateAiResponse}
            >
              <ArrowSyncRegular size={"16px"} />
            </button>
          </Tooltip>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .send-item,
  .recieve-item {
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
    margin-bottom: 10px;
  }

  /* :global(.message-wrapper) {
    overflow: hidden !important;
  } */

  :global(.wrapper) {
    position: relative;
  }

  :global(.code-header) {
    position: absolute;
    right: 0;
    transform: translate(-30%, -50%);
    border-radius: 4px;
    background-color: var(--border-ds-surface-500);
    border: 1px solid var(--border-ds-surface-300);
    padding: 2px;
    gap: 2px;
  }

  :global(.message-wrapper .hljs) {
    max-width: 496px;
    min-width: 276px;
    max-height: 400px;
    min-height: 70px;

    /* *sparrow black is not rendering, so using hardcode hexcode* */
    /* background: var(--sparrow-black) !important; */
    background: #000 !important;

    border: 2px solid var(--border-ds-surface-400);
    border-radius: 8px;
    overflow-y: auto;
    overflow-x: hidden;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Styling code block scroll bar */
  :global(.message-wrapper .hljs::-webkit-scrollbar-thumb) {
    background-color: var(--bg-ds-surface-100);
  }
  :global(.message-wrapper .hljs::-webkit-scrollbar),
  :global(.message-wrapper .hljs::-webkit-scrollbar-thumb),
  :global(.message-wrapper .hljs::-webkit-scrollbar-button) {
    cursor: pointer;
  }

  :global(.action-button) {
    height: 28px;
    width: 28px;
    background-color: transparent;
    box-shadow: none;
    border: none;
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

  :global(.codeBlock-action-btns-tooltip) {
    transition: 0.3s ease;
    font-weight: 400;
    font-size: 12px;
    font: Inter, sans-serif;
    gap: 6px;
    bottom: 40px;
    border-radius: 4px;
    left: 50%;
    transform: translateX(-50%);
    position: absolute;
    padding: 4px 8px;
    background-color: var(--bg-ds-surface-100);
    opacity: 0;
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  }
  :global(.codeBlock-action-btns-tooltip-square) {
    position: absolute;
    bottom: -5px;
    left: 50%;
    border-radius: 2px;
    height: 10px;
    width: 10px;
    background-color: var(--bg-ds-surface-100);
    transform: translateX(-38%) rotate(45deg); /* Rotate 45 degrees */
  }
  :global(
    .codeBlock-action-btns-selector:hover .codeBlock-action-btns-tooltip
  ) {
    visibility: visible !important;
    opacity: 1;
  }
</style>
