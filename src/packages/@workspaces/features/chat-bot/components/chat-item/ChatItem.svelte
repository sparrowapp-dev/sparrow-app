<script lang="ts">
  import { onMount, onDestroy } from "svelte";
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
  import P from "@library/typography/p/P.svelte";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums";

  export let message;
  export let messageId;
  export let type;
  export let isLiked;
  export let isDisliked;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let isLastRecieverMessage;
  export let status;

  const decode = (htmlString: string) => {
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
      // Create a new container div
      const container = document.createElement("div");
      container.className = "wrapper";
      const lang = pre.querySelector("code").getAttribute("class");
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
      pre.parentNode.insertBefore(container, pre);
      container.appendChild(pre);
    });

    // Serialize the DOM back into a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  };

  const handleCopyClick = (event) => {
    const target = event.target.closest(".wrapper");
    if (target) {
      const code = target.querySelector("pre code").textContent;
      navigator.clipboard
        .writeText(code)
        .then(() => {
          notifications.success("Code copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy code: ", err);
        });
    }
  };

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

  let cleanUpListeners;

  let extractedMessage = "";
  onMount(() => {
    extractedMessage = decode(marked(message));
    // Add event listeners to all dynamically inserted wrappers

    setTimeout(() => {
      const wrappers = document.querySelectorAll(`.copy-code-${messageId}`);
      cleanUpListeners = () => {
        wrappers.forEach((wrapper) => {
          wrapper.removeEventListener("click", handleCopyClick);
        });
      };
      wrappers.forEach((wrapper) => {
        wrapper.addEventListener("click", handleCopyClick);
      });
    }, 200);
  });

  $: {
    if (message) {
      extractedMessage = decode(marked(message));
      setTimeout(() => {
        const wrappers = document.querySelectorAll(`.copy-code-${messageId}`);
        cleanUpListeners = () => {
          wrappers.forEach((wrapper) => {
            wrapper.removeEventListener("click", handleCopyClick);
          });
        };
        wrappers.forEach((wrapper) => {
          wrapper.addEventListener("click", handleCopyClick);
        });
      }, 300);
    }
  }

  onDestroy(() => {
    // Clean up event listeners
    if (cleanUpListeners) {
      cleanUpListeners();
    }
  });
</script>

<div class="message-wrapper">
  {#if type === "SENDER"}
    <div class="send-item">
      <p class="my-4 px-3 text-fs-12">{@html message}</p>
    </div>
  {:else}
    <div class="recieve-item p-3">
      <div class="d-flex justify-content-between">
        <SparrowAIIcon height={"20px"} width={"20px"} />
        <div class="d-flex gap-1 pb-2">
          {#if status}
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
