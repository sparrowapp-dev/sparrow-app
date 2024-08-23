class MarkdownFormatter {
  /**
   * FormatData function to format the markdown string to the required format.
   * @param string - The markdown string to format.
   * @returns A promise that resolves to the formatted data.
   */
  public async FormatData(markdownString: string) {
    const lines = markdownString.split("\n");
    const blocks: Block[] = [];

    interface Block {
      id: string;
      type: string;
      data: {
        text?: string;
        style?: string;
        items?: string[];
        code?: string;
      };
      level?: number;
    }
    let currentBlock: Block | null = null;

    function pushCurrentBlock() {
      if (currentBlock) {
        currentBlock.id = Math.random().toString(36).substr(2, 9);
        blocks.push(currentBlock);
        currentBlock = null;
      }
    }

    function createParagraph(text: string) {
      return {
        type: "paragraph",
        data: { text: text },
      };
    }

    function processInlineMarkdown(text: string) {
      // Handle bold
      text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
      // Handle italic
      text = text.replace(/\*(.*?)\*/g, "<i>$1</i>");
      // Handle code
      text = text.replace(/`(.*?)`/g, "<code>$1</code>");
      return text;
    }

    lines.forEach((line, index) => {
      line = line.trim();

      if (line === "") {
        pushCurrentBlock();
      } else if (line.startsWith("#")) {
        pushCurrentBlock();
        const level = line.split(" ")[0].length;
        if (level <= 6) {
          currentBlock = {
            type: "header",
            data: {
              text: processInlineMarkdown(line.substring(level + 1)),
              level: level,
            },
          };
        } else {
          currentBlock = createParagraph(processInlineMarkdown(line));
        }
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!currentBlock || currentBlock.type !== "list") {
          pushCurrentBlock();
          currentBlock = {
            type: "list",
            data: { style: "unordered", items: [] },
          };
        }
        currentBlock.data.items.push(processInlineMarkdown(line.substring(2)));
      } else if (line.match(/^\d+\. /)) {
        if (!currentBlock || currentBlock.type !== "list") {
          pushCurrentBlock();
          currentBlock = {
            type: "list",
            data: { style: "ordered", items: [] },
          };
        }
        currentBlock.data.items.push(
          processInlineMarkdown(line.substring(line.indexOf(" ") + 1)),
        );
      } else if (line.startsWith("```")) {
        if (currentBlock && currentBlock.type === "code") {
          pushCurrentBlock();
        } else {
          pushCurrentBlock();
          currentBlock = {
            type: "code",
            data: { code: "" },
          };
        }
      } else if (currentBlock && currentBlock.type === "code") {
        currentBlock.data.code += (currentBlock.data.code ? "\n" : "") + line;
      } else {
        if (!currentBlock || currentBlock.type !== "paragraph") {
          pushCurrentBlock();
          currentBlock = createParagraph("");
        }
        currentBlock.data.text +=
          (currentBlock.data.text ? "<br>" : "") + processInlineMarkdown(line);
      }

      if (index === lines.length - 1) {
        pushCurrentBlock();
      }
    });

    return {
      time: Date.now(),
      blocks: blocks,
      version: "2.30.4",
    };
  }
}

export default MarkdownFormatter;
