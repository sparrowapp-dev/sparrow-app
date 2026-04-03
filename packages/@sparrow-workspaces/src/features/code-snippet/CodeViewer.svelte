<script lang="ts">
  import hljs from "highlight.js";

  export let code: string = "";
  export let language: string = "javascript";

  let highlighted = "";
  let lines: string[] = [];

  const langMap: Record<string, string> = {
    node: "javascript",
    javascript: "javascript",
    python: "python",
    java: "java",
    csharp: "csharp",
  };

  $: {
    const safeLang = langMap[language] || "plaintext";
    const safeCode = code || "// No code available";

    try {
      highlighted = hljs.highlight(safeCode, { language: safeLang }).value;
    } catch {
      highlighted = hljs.highlightAuto(safeCode).value;
    }
    lines = highlighted
      .split("\n")
      .filter((line, i, arr) => {
        if (i === 0 || i === arr.length - 1) {
          return line.trim() !== "";
        }
        return true;
      })
      .reduce((acc: string[], line) => {
        const isEmpty = line.trim() === "";
        const prevEmpty = acc.length > 0 && acc[acc.length - 1].trim() === "";

        if (isEmpty && prevEmpty) return acc;

        acc.push(line);
        return acc;
      }, []);
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
    background: transparent;
    border-radius: 6px;
    padding: 6px 8px;
    user-select: text;
    height: 100%;
  }

  .code-line {
    display: flex;
    align-items: flex-start;
  }

  .line-number {
    width: 28px;
    text-align: right;
    padding-right: 10px;
    margin-right: 10px;
    color: #6b7280;
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

  /* Base */
  .hljs {
    color: #e5e7eb !important; /* default white */
    background: transparent !important;
  }

  /* Keywords → const, let */
  .hljs-keyword {
    color: #3b82f6 !important; /* blue */
  }

  /* Strings → "GET" */
  .hljs-string {
    color: #facc15 !important; /* yellow */
  }

  /* Numbers */
  .hljs-number {
    color: #facc15 !important;
  }

  /* Function names */
  .hljs-title,
  .hljs-title.function_ {
    color: #3b82f6 !important;
  }

  /* Built-in (like fetch, console) */
  .hljs-built_in {
    color: #22c55e !important; /* green */
  }

  /* ⚠️ IMPORTANT FIX */
  .hljs-attr,
  .hljs-property {
    color: #e5e7eb !important; /* WHITE (this fixes "method") */
  }

  /* Variables */
  .hljs-variable {
    color: #e5e7eb !important;
  }

  /* Comments */
  .hljs-comment {
    color: #6b7280 !important;
  }

  /* Punctuation */
  .hljs-punctuation {
    color: #9ca3af !important;
  }
  code {
    color: inherit;
  }

  .code-line:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
