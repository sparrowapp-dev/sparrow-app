<script lang="ts">
  import hljs from "highlight.js";
  import "highlight.js/styles/github-dark.css";

  export let code: string = "";
  export let language: string = "javascript";

  let highlighted = "";
  let lines: string[] = [];

  $: {
    try {
      highlighted = hljs.highlight(code, { language }).value;
    } catch {
      highlighted = hljs.highlightAuto(code).value;
    }
    lines = highlighted.split("\n");
  }
</script>

<div class="code-container">
  {#each lines as line, i}
    <div class="code-line">
      <div class="line-number">{i + 1}</div>

      <!-- IMPORTANT: use html for highlight -->
      <div class="line-content">
        <code>{@html line || " "}</code>
      </div>
    </div>
  {/each}
</div>

<style>
  .code-container {
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.6;
    background: #0b1220;
    border-radius: 6px;
    padding: 12px;
    user-select: text;
  }

  .code-line {
    display: flex;
    align-items: flex-start;
  }

  .line-number {
    width: 32px;
    text-align: right;
    padding-right: 10px;
    margin-right: 10px;
    border-right: 1px solid #30363d;
    color: #6e7681;
    user-select: none;
    flex-shrink: 0;
  }

  .line-content {
    flex: 1;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .line-content code {
    display: block;
  }

  /* 🔥 BASE HLJS */
  .hljs {
    color: #e6edf3;
    background: transparent;
  }

  /* KEYWORDS */
  .hljs-keyword {
    color: #ff7b72;
  }

  /* STRINGS */
  .hljs-string {
    color: #a5d6ff;
  }

  /* NUMBERS */
  .hljs-number {
    color: #79c0ff;
  }

  /* VARIABLES / KEYS */
  .hljs-attr,
  .hljs-variable,
  .hljs-property {
    color: #c9d1d9;
  }

  /* FUNCTIONS */
  .hljs-title.function_,
  .hljs-title {
    color: #d2a8ff;
  }

  /* BUILT-IN */
  .hljs-built_in {
    color: #ffa657;
  }

  /* COMMENTS */
  .hljs-comment {
    color: #8b949e;
  }

  /* PUNCTUATION */
  .hljs-punctuation {
    color: #c9d1d9;
  }

  .code-line:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
