<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { AISparkle } from "../../assests";
  import { marked } from "marked";
  import { notifications } from "@library/ui/toast/Toast";
  import { copyIcon } from "../../assests";

  import hljs from "highlight.js";
  import "highlight.js/styles/atom-one-dark.css";

  export let message;
  export let messageId;
  export let type;

  const decode = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Select all <pre> elements
    const preElements = doc.querySelectorAll("pre");

    // Iterate over each <pre> element
    preElements.forEach((pre) => {
      // Create a new container div
      const container = document.createElement("div");
      container.className = "wrapper";
      const lang = pre.querySelector("code").getAttribute("class");
      hljs.highlightBlock(pre.querySelector("code"));
      // Add content or value to the container div
      container.innerHTML = `
    <div class="code-header bg-tertiary-300 px-3 py-2 d-flex justify-content-between"
    
    style="">
      <span>${lang.split("-")[1]}</span>
      <span role="button" class="copy-code-${messageId}">
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
      <AISparkle />
      <div class="markdown">{@html extractedMessage}</div>
    </div>
  {/if}
</div>

<style>
  .send-item {
    border-bottom: 1px solid grey;
  }
  .recieve-item {
    border-bottom: 1px solid grey;
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
    background-color: black;
    /* padding: 10px; */
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
</style>
