<script lang="ts">
  import { onDestroy } from "svelte";
  import { marked } from "marked";
  import { notifications } from "@sparrow/library/ui";
  import {
    copyIcon,
    tickIcon,
    ArrowExpand,
    ArrowTrendingSparkle,
  } from "../../assests";
  import { tick } from "svelte";

  import hljs from "highlight.js";
  import "highlight.js/styles/atom-one-dark.css";
  import { TickIcon } from "@sparrow/library/icons";
  import { SparrowAIIcon } from "@sparrow/common/icons";
  import { Tooltip } from "@sparrow/library/ui";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import {
    MessageTypeEnum,
    RequestDatasetEnum,
    RequestDataTypeEnum,
    RequestSectionEnum,
  } from "@sparrow/common/types/workspace";
  import { ArrowSyncRegular, ThumbLikeRegular } from "@sparrow/library/icons";
  import {
    ThumbLikeFilled,
    ThumbDislikeFilled,
    CopyRegular,
    ThumbDislikeRegular,
  } from "@sparrow/library/icons";
  import * as Sentry from "@sentry/svelte";

  import ResponseStatus from "../../../response-status/ResponseStatus.svelte";
  import { OpenAIModelEnum } from "@sparrow/common/types/workspace/ai-request-base";
  import {
    AiRequestExplorerDataStore,
    type AiRequestExplorerData,
  } from "@sparrow/workspaces/features/ai-request-explorer/store";

  export let message: string;
  export let messageId: string;
  export let type;
  export let isLiked;
  export let isDisliked;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let isLastRecieverMessage;
  export let status;
  export let isResponseGenerating;
  // export let chatResponse: AiRequestExplorerData;
  export let modelVariant: string;
  export let aiResponseMetrices: AiRequestExplorerData;

  export let onClickCodeBlockPreview;
  export let handleApplyChangeOnAISuggestion;
  let showTickIcon: boolean = false;

  /**
   * Validates if the metadata sent by AI wrapped inside HTML comment
   * Check if the metadata sent by AI is application user friendly (Matching with request data or not).
   *
   * @param target - The target value (Where to apply the change -> Req. Body or Headers or Parameters)
   * @param language - The language value of the code suggested (Json, html, javascript etc)
   * @param type - The type value (Raw, url encoded, formdata)
   * @returns boolean indicating if all values are valid according to the enums
   */
  const validateMetadata = (
    target: RequestSectionEnum,
    language: RequestDataTypeEnum,
    type: RequestDatasetEnum,
  ): boolean => {
    // Check if target is valid - must match a value in RequestSectionEnum
    const validTargets = Object.values(RequestSectionEnum);
    if (!target || !validTargets.includes(target)) {
      console.debug(
        `Invalid target: ${target}, expected one of: ${validTargets.join(", ")}`,
      );
      return false;
    }

    // Check if language is valid - must match a value in RequestDataTypeEnum
    const validLanguages = Object.values(RequestDataTypeEnum);
    if (!language || !validLanguages.includes(language)) {
      console.debug(
        `Invalid language: ${language}, expected one of: ${validLanguages.join(", ")}`,
      );
      return false;
    }

    // Check if type is valid - must match a value in RequestDatasetEnum
    const validTypes = Object.values(RequestDatasetEnum);
    if (!type || !validTypes.includes(type)) {
      console.debug(
        `Invalid type: ${type}, expected one of: ${validTypes.join(", ")}`,
      );
      return false;
    }

    // For non-REQUEST_BODY targets, type should be NONE
    if (
      target !== RequestSectionEnum.REQUEST_BODY &&
      type !== RequestDatasetEnum.NONE
    ) {
      console.log(
        `Invalid type: ${type} for target: ${target}, expected ${RequestDatasetEnum.NONE}`,
      );
      return false;
    }

    // All checks passed
    return true;
  };

  /**
   * Decodes an HTML string by parsing it, processing <pre><code> elements, and wrapping them
   * in custom containers with additional copy paste functionality.
   * Validates actionable code blocks against application enums.
   *
   * @param htmlString - The HTML string to decode and process.
   * @returns The processed HTML string.
   */
  const decodeMessage = (htmlString: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // First, process actionable code blocks
    const preElements = doc.querySelectorAll("pre");
    preElements.forEach((pre) => {
      const codeElem = pre.querySelector("code");
      if (!codeElem) return;

      // Check if this pre element is preceded by an HTML comment
      let previousNode = pre.previousSibling;
      let isActionable = false;
      let actionableTarget = "";
      let actionableLanguage = "";
      let actionableType = "";

      // Look for HTML comment nodes that might contain actionable metadata
      while (previousNode) {
        // Check if it's a comment node
        if (previousNode.nodeType === Node.COMMENT_NODE) {
          const commentContent = previousNode.textContent || "";

          // Check if this is a suggestion comment
          if (commentContent.includes("suggestion:")) {
            // Extract target from suggestion comment
            const targetMatch = commentContent.match(/target=([^;]+)/);
            if (targetMatch && targetMatch[1]) {
              actionableTarget = targetMatch[1].trim();
            }

            // Extract language from suggestion comment
            const langMatch = commentContent.match(/lang=([^;]+)/);
            if (langMatch && langMatch[1]) {
              actionableLanguage = langMatch[1].trim();
            }

            // Extract type from suggestion comment
            const typeMatch = commentContent.match(/type=([^;]+)/);
            if (typeMatch && typeMatch[1]) {
              actionableType = typeMatch[1].trim();
            }

            // actionableTarget = "BSON";
            // actionableType = ""
            // actionableLanguage = ""

            // Validate metadata against application enums
            isActionable = validateMetadata(
              actionableTarget as RequestSectionEnum,
              actionableLanguage as RequestDataTypeEnum,
              actionableType as RequestDatasetEnum,
            );

            // console.log("Found suggestion comment:", {
            //   target: actionableTarget,
            //   language: actionableLanguage,
            //   type: actionableType,
            //   isActionable: isActionable,
            // });
          }

          // Remove the comment node after processing
          const commentToRemove = previousNode;
          previousNode = previousNode.previousSibling;
          commentToRemove.parentNode?.removeChild(commentToRemove);
          continue;
        }

        // If it's a whitespace text node, continue checking previous nodes
        if (
          previousNode.nodeType === Node.TEXT_NODE &&
          previousNode.textContent?.trim() === ""
        ) {
          previousNode = previousNode.previousSibling;
          continue;
        }

        // If we reach a non-comment, non-whitespace node, stop checking
        break;
      }

      // If we found an actionable block that passed validation, mark it with the necessary metadata
      if (isActionable) {
        // Store the actionable metadata as a data attribute for later use
        pre.setAttribute(
          "data-actionable",
          JSON.stringify({
            target: actionableTarget,
            language: actionableLanguage,
            type: actionableType,
          }),
        );
      }
    });

    // Now process all code blocks for syntax highlighting
    const codeElements = doc.querySelectorAll("pre > code");
    const highlightedPreElements = Array.from(codeElements)
      .filter((elem) => {
        if (elem.innerHTML.trim()) return true;
        return false;
      })
      .map((codeElem) => codeElem.parentElement);

    highlightedPreElements.forEach((pre, index) => {
      if (pre) {
        // Create a new container div
        const container = document.createElement("div");
        container.className = "wrapper";
        const lang = pre.querySelector("code")?.getAttribute("class");
        hljs.highlightBlock(pre.querySelector("code"));

        // Check if this was an actionable block
        const actionableData = pre.getAttribute("data-actionable");
        let additionalButtons = "";

        // Add a "Apply Change" button for actionable blocks
        if (actionableData) {
          additionalButtons = `
        <button role="button" class="position-relative apply-change-${messageId} action-button codeBlock-action-btns-selector d-flex align-items-center justify-content-center border-radius-4" id="${index}" data-actionable='${actionableData}'>
          <img src="${ArrowTrendingSparkle}" id="${index}">
          <div class="codeBlock-action-btns-tooltip">Insert Suggestions<div class="codeBlock-action-btns-tooltip-square"></div>
          </div>
        </button>
      `;
        }

        // Adding code block action buttons like copy code and preview code
        container.innerHTML = `
        <div class="code-header d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            ${additionalButtons}
            <button role="button" class="position-relative preview-code-${messageId} action-button codeBlock-action-btns-selector d-flex align-items-center justify-content-center border-radius-4" id="${index}">
              <img src="${ArrowExpand}" id="${index}">
              <div class="codeBlock-action-btns-tooltip">Preview
                <div class="codeBlock-action-btns-tooltip-square"></div>
              </div>
            </button>
          </div>
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

  // Add the handleApplyChange function
  const handleApplyChange = (event: MouseEvent) => {
    const button = event.target as HTMLElement;
    const actionableButton = button.closest("[data-actionable]");
    const actionableData = actionableButton?.getAttribute("data-actionable");

    if (actionableData) {
      try {
        const metaData = JSON.parse(actionableData);
        const wrapper = actionableButton.closest(
          ".wrapper",
        ) as HTMLElement | null;

        if (wrapper) {
          const codeElement = wrapper.querySelector(
            "pre code",
          ) as HTMLElement | null;
          if (codeElement) {
            const codeContent = codeElement.textContent || "";

            let target: RequestSectionEnum = metaData.target;
            let language: RequestDataTypeEnum = metaData.language;
            let requestBodyType: RequestDatasetEnum = metaData.type;

            let modifiedContent =
              language === RequestDataTypeEnum.JSON
                ? JSON.stringify(JSON.parse(codeContent), null, 2)
                : codeContent;

            handleApplyChangeOnAISuggestion(
              target,
              language,
              requestBodyType,
              modifiedContent,
            );

            // Optional: Provide visual feedback that change was sent
            const img = actionableButton?.querySelector("img");
            if (img) {
              const originalSrc = img?.src;
              img.src = tickIcon;
              img.classList.add("tick-icon");
              setTimeout(() => {
                img.src = originalSrc;
                img.classList.remove("tick-icon");
              }, 3000);
            }
          }
        }
      } catch (e) {
        console.error("Failed to apply change:", e);
        notifications.error("Failed to apply change");
      }
    }
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
          Sentry.captureException(err);
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
    const wrapper = (event.target as HTMLElement).closest(".wrapper");
    if (!wrapper) return;
    const originalCodeBlock = wrapper.querySelector("pre > code.hljs");
    const originalPreElement = originalCodeBlock?.parentElement;
    if (!originalCodeBlock || !originalPreElement) return;
    const preClone = originalPreElement.cloneNode(true) as HTMLPreElement;
    onClickCodeBlockPreview(preClone);
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
      Sentry.captureException(err);
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

    setTimeout(() => {
      const copyCodeBtns = document.querySelectorAll(`.copy-code-${messageId}`);
      const previewCodeBtns = document.querySelectorAll(
        `.preview-code-${messageId}`,
      );
      const applyChangeBtns = document.querySelectorAll(
        `.apply-change-${messageId}`,
      );

      // Remove previous event listeners
      cleanUpListeners();

      // Add listeners for copy code buttons
      copyCodeBtns.forEach((btn) => {
        btn.addEventListener("click", handleCopyCode);
      });

      // Add listeners for preview code buttons
      previewCodeBtns.forEach((btn) => {
        btn.addEventListener("click", handleCodePreview);
      });

      // Add listeners for apply change buttons
      applyChangeBtns.forEach((btn) => {
        btn.addEventListener("click", handleApplyChange);
      });

      // Update cleanup function
      cleanUpListeners = () => {
        copyCodeBtns.forEach((btn) => {
          btn.removeEventListener("click", handleCopyCode);
        });
        previewCodeBtns.forEach((btn) => {
          btn.removeEventListener("click", handleCodePreview);
        });
        applyChangeBtns.forEach((btn) => {
          btn.removeEventListener("click", handleApplyChange);
        });
      };
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
      <ResponseStatus
        response={{
          tokenCount: aiResponseMetrices?.response.inputTokens || 0,
          AI_Model_Variant: aiResponseMetrices?.response.modelVariant || "",
          AI_Model_Provider: aiResponseMetrices?.response.modelProvider || "",
        }}
        responseType={"Sender"}
      />

      <p
        class=" px-3 text-fs-12"
        style="background-color: var(--bg-ds-surface-500); 
        height: auto; 
        width:fit-content;
        border-radius: 8px; 
        padding: 8px; 
        margin-left: auto; 
        margin-right: 5px; 
        margin-bottom: 0px;
        max-width: 248px; 
        text-align: left;
        font-size:14px;
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
      <!-- {#if !isResponseGenerating} -->
      <ResponseStatus
        response={{
          time: aiResponseMetrices?.response.time || 0,
          status: aiResponseMetrices?.response.statusCode || "",
          tokenCount: aiResponseMetrices?.response.outputTokens || 0,
          AI_Model_Variant: aiResponseMetrices?.response.modelVariant || "",
        }}
        responseType={"Receiver"}
      />
      <!-- {/if} -->
      {#if status}
        <div class="markdown">
          {@html extractedMessage}
        </div>
      {:else}
        <div class="markdown error-message p-2 border-radius-4">
          <p class="mb-0">{message}</p>
        </div>
      {/if}
      <div class="d-flex gap-1">
        <!--
        -- 
        -- REGENERATE / COPY
        -- 
        -->

        <!-- Show only if last message is not an error message -->
        {#if !isResponseGenerating && isLastRecieverMessage && status}
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
                <TickIcon width={"18px"} height={"18px"} color={"grey"} />
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
    font-size: 14px;
  }

  .markdown {
    width: 85%;
    background-color: var(--text-ds-surface-800);
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 4px;
  }
  .markdown.error-message {
    border: 0.2px solid var(--border-danger-200);
    color: var(--border-danger-200);
  }

  :global(.message-wrapper .markdown pre) {
    margin-bottom: 0;
  }

  :global(.message-wrapper .wrapper) {
    border-radius: 4px !important;
    margin-bottom: 10px;
  }

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
