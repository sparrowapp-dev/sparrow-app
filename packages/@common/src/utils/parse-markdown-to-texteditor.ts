import type { Block } from "@sparrow/common/types/editorjs";

class MarkdownFormatter {
  /**
   * FormatData function to format the markdown string to the required format.
   * @param string - The markdown string to format.
   * @returns A promise that resolves to the formatted data.
   */
  // Define the blocks array to hold the formatted blocks.
  private blocks: Block[] = [];

  // Define the currentBlock that will be manipulated during processing.
  private currentBlock: Block | null = null;

  // Adds the current block to the blocks array and resets the currentBlock.
  private pushCurrentBlock = () => {
    if (this.currentBlock) {
      this.currentBlock.id = Math.random().toString(36).substr(2, 9);
      this.blocks.push(this.currentBlock);
      this.currentBlock = null;
    }
  };

  // Creates a paragraph block with the given text.
  private createParagraph = (text: string) => {
    return {
      type: "paragraph",
      data: { text: text },
    };
  };

  // Processes inline markdown syntax in a string.
  // Replaces markdown for bold, italic, and code with corresponding HTML tags.
  private processInlineMarkdown = (text: string) => {
    // Handle bold
    text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    // Handle italic
    text = text.replace(/\*(.*?)\*/g, "<i>$1</i>");
    // Handle code
    text = text.replace(/`(.*?)`/g, "<code>$1</code>");
    return text;
  };

  public async FormatData(markdownString: string) {
    const lines = markdownString.split("\n");
    this.blocks = []; // Reset blocks array before processing
    this.currentBlock = null; // Reset currentBlock before processing

    lines.forEach((line, index) => {
      line = line.trim();

      if (line === "") {
        // If the line is empty, push the current block to the blocks array
        this.pushCurrentBlock();
      } else if (line.startsWith("#")) {
        // If the line starts with a heading marker (#), process it as a header
        this.pushCurrentBlock();
        const level = line.split(" ")[0].length;
        if (level <= 6) {
          // If the heading level is 6 or less, create a header block
          this.currentBlock = {
            type: "header",
            data: {
              text: this.processInlineMarkdown(line.substring(level + 1)),
              level: level,
            },
          };
        } else {
          // If the heading level is more than 6, treat it as a paragraph
          this.currentBlock = this.createParagraph(
            this.processInlineMarkdown(line),
          );
        }
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        // If the line starts with an unordered list marker (- or *), process it as a list
        if (!this.currentBlock || this.currentBlock.type !== "list") {
          // Start a new unordered list block if not already in one
          this.pushCurrentBlock();
          this.currentBlock = {
            type: "list",
            data: { style: "unordered", items: [] },
          };
        }
        // Add the list item to the current block

        this.currentBlock.data.items!.push(
          this.processInlineMarkdown(line.substring(2)),
        );
      } else if (line.match(/^\d+\. /)) {
        // If the line starts with an ordered list marker (e.g., 1.), process it as a list
        if (!this.currentBlock || this.currentBlock.type !== "list") {
          // Start a new ordered list block if not already in one
          this.pushCurrentBlock();
          this.currentBlock = {
            type: "list",
            data: { style: "ordered", items: [] },
          };
        }
        // Add the list item to the current block
        this.currentBlock.data.items!.push(
          this.processInlineMarkdown(line.substring(line.indexOf(" ") + 1)),
        );
      } else if (line.startsWith("```")) {
        // If the line starts with a code block marker (```), process it as a code block
        if (this.currentBlock && this.currentBlock.type === "code") {
          // If already in a code block, close it
          this.pushCurrentBlock();
        } else {
          this.pushCurrentBlock();
          this.currentBlock = {
            type: "code",
            data: { code: "" },
          };
        }
      } else if (this.currentBlock && this.currentBlock.type === "code") {
        // If inside a code block, append the line to the code content
        this.currentBlock.data.code! +=
          (this.currentBlock.data.code ? "\n" : "") + line;
      } else {
        if (!this.currentBlock || this.currentBlock.type !== "paragraph") {
          // Otherwise, treat the line as part of a paragraph
          this.pushCurrentBlock();
          this.currentBlock = this.createParagraph("");
        }
        // Append the line to the paragraph content, using <br> for new lines
        this.currentBlock.data.text! +=
          (this.currentBlock.data.text ? "<br>" : "") +
          this.processInlineMarkdown(line);
      }
      // Push the final block when processing the last line
      if (index === lines.length - 1) {
        this.pushCurrentBlock();
      }
    });

    return {
      time: Date.now(),
      blocks: this.blocks,
      version: "2.30.4",
    };
  }
}

export { MarkdownFormatter };
