export class FormatCurl {
  public handleFormatCurl = (curlCommand: string): string => {
    // Step 1: Extract and remove special literals (raw literals and heredocs)
    const {
      command: commandWithoutLiterals,
      rawLiteral,
      heredoc,
    } = this.extractSpecialLiterals(curlCommand);

    // Step 2: Pre-process apostrophes in single-quoted data payloads
    let processedCommand = this.escapeApostrophesInSingleQuotedData(
      commandWithoutLiterals,
    );

    // Step 3: Check if command has malformed single-quoted data
    if (this.hasMalformedSingleQuotedData(processedCommand)) {
      return this.applyMinimalFormatting(processedCommand, heredoc, rawLiteral);
    }

    // Step 4: Apply full formatting
    const normalized = this.normalizeWhitespace(processedCommand);
    const tokenized = this.tokenizeCommand(normalized);
    const formatted = this.formatTokens(tokenized);
    const withLiterals = this.reattachSpecialLiterals(
      formatted,
      heredoc,
      rawLiteral,
    );
    const cleaned = this.cleanUpFormatting(withLiterals);
    const escaped = this.escapeSingleQuotesForCurl(cleaned);

    // Step 5: Fix any escaping artifacts
    return this.repairEscapingArtifacts(escaped);
  };

  /**
   * Extracts raw literals ($'...') and heredocs (<<EOF...EOF) from the command
   */
  private extractSpecialLiterals(curlCommand: string): {
    command: string;
    rawLiteral: string;
    heredoc: string;
  } {
    let command = curlCommand;
    let rawLiteral = "";
    let heredoc = "";

    // Extract raw literal syntax: $'...'
    const rawLiteralRegex = /(\$'[\s\S]*?')$/m;
    const rawMatch = command.match(rawLiteralRegex);
    if (rawMatch) {
      rawLiteral = rawMatch[0];
      command = command.slice(0, rawMatch.index).trim();
    }

    // Extract heredoc syntax: <<EOF...EOF
    const heredocRegex = /(<<\s*EOF[\s\S]*?^EOF\s*)$/m;
    const heredocMatch = command.match(heredocRegex);
    if (heredocMatch) {
      heredoc = heredocMatch[0]
        .replace(/\r\n/g, "\n")
        .replace(/^\s+|\s+$/g, "");
      command = command.slice(0, heredocMatch.index).trim();
    }

    return { command, rawLiteral, heredoc };
  }

  /**
   * Checks if the command has malformed single-quoted data (odd number of quotes)
   */
  private hasMalformedSingleQuotedData(command: string): boolean {
    const hasDataFlagWithQuote = /(?:--data(?:-raw)?|-d)\s+'/.test(command);
    const singleQuoteCount = (command.match(/'/g) || []).length;
    return hasDataFlagWithQuote && singleQuoteCount % 2 === 1;
  }

  /**
   * Applies minimal formatting for malformed commands to avoid breaking them
   */
  private applyMinimalFormatting(
    command: string,
    heredoc: string,
    rawLiteral: string,
  ): string {
    let formatted = command
      .replace(/\\\s*\n\s*/g, " ") // join line continuations
      .replace(/\s+/g, " ") // collapse excess whitespace
      .trim();

    if (heredoc) {
      formatted += ` \\\n  ${heredoc}`;
    }

    if (rawLiteral && !formatted.includes(rawLiteral)) {
      formatted += ` \\\n  ${rawLiteral}`;
    }

    return formatted;
  }

  /**
   * Normalizes whitespace and removes line continuations
   */
  private normalizeWhitespace(command: string): string {
    return command
      .replace(/\\\s*\n\s*/g, " ") // join escaped newlines
      .replace(/\\\s*/g, " ") // remove other backslash escapes
      .replace(/\s+/g, " ") // collapse multiple spaces
      .trim();
  }

  /**
   * Splits command into tokens, preserving quoted strings
   */
  private tokenizeCommand(command: string): string[] {
    return command.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  }

  /**
   * Formats tokens with proper line breaks and indentation
   */
  private formatTokens(tokens: string[]): string {
    let formatted = "";

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const previousToken = tokens[i - 1];

      if (i === 0) {
        // First token (curl command itself)
        formatted += token;
      } else if (this.isFlag(token)) {
        // Flags get new lines
        formatted += " \\\n  " + token;
      } else if (this.shouldBeOnNewLine(token, previousToken)) {
        // URLs and certain patterns get new lines
        formatted += " \\\n  " + token;
      } else {
        // Everything else stays on same line
        formatted += " " + token;
      }
    }

    return formatted;
  }

  /**
   * Checks if a token is a command-line flag
   */
  private isFlag(token: string): boolean {
    return (
      token.startsWith("--") || (token.startsWith("-") && !/^-\d/.test(token))
    );
  }

  /**
   * Determines if a token should be placed on a new line
   */
  private shouldBeOnNewLine(token: string, previousToken?: string): boolean {
    const isUrl = /^https?:\/\//.test(token);
    const isVariableExpansion = /^\$\{.*\}/.test(token);
    const isSimpleValue = /^[\w\/:.?&=%-]+$/.test(token);
    const previousIsRequestFlag = previousToken?.startsWith("--request");

    if (isUrl || isVariableExpansion || isSimpleValue) {
      return !previousIsRequestFlag;
    }

    return false;
  }

  /**
   * Reattaches heredocs and raw literals that were extracted earlier
   */
  private reattachSpecialLiterals(
    formatted: string,
    heredoc: string,
    rawLiteral: string,
  ): string {
    let result = formatted;

    if (heredoc) {
      const [firstLine, ...restLines] = heredoc.split("\n");
      result += " \\\n  " + firstLine + "\n" + restLines.join("\n");
    }

    if (rawLiteral && !result.includes(rawLiteral)) {
      result += ` \\\n  ${rawLiteral}`;
    }

    return result;
  }

  /**
   * Cleans up formatting artifacts (like colons after line continuations)
   */
  private cleanUpFormatting(formatted: string): string {
    return formatted.replace(/\\\n\s*:/g, ":").trim();
  }

  /**
   * Repairs common escaping artifacts created during formatting
   */
  private repairEscapingArtifacts(escaped: string): string {
    return escaped
      .replace(/'\s*'\\''/g, "'\\''") // Fix: ' '\''
      .replace(/'\s*''/g, "'\\''") // Fix: ' ''
      .replace(/([A-Za-z0-9])'\s*''([A-Za-z0-9])/g, "$1'\\''$2") // Fix: word' ''s
      .replace(/'\s*''/g, "'\\''"); // Last resort fix
  }

  private escapeSingleQuotesForCurl = (input: string): string => {
    if (!input) return input;

    // Handle apostrophes with spaces: President' s -> President'\''s
    const spacedApostrophePattern = /([A-Za-z0-9])'\s+([A-Za-z0-9])/g;
    input = input.replace(
      spacedApostrophePattern,
      (_match, before: string, after: string) => `${before}'\\''${after}`,
    );

    // Handle tight apostrophes: President's -> President'\''s
    const tightApostrophePattern = /([A-Za-z0-9])'(?!\\'')([A-Za-z0-9])/g;
    input = input.replace(
      tightApostrophePattern,
      (_match, before: string, after: string) => `${before}'\\''${after}`,
    );

    return input;
  };

  private escapeApostrophesInSingleQuotedData(curlCommand: string): string {
    // First, normalize any already-escaped sequences back to single quotes
    let normalized = curlCommand.replace(/' ''/g, "'");

    // Pattern to find data flags with single-quoted values
    const dataFlagPattern = /(^|\s)(-d|--data(?:-raw)?|--data-binary)\s+'/g;

    let result = "";
    let lastProcessedIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = dataFlagPattern.exec(normalized)) !== null) {
      const openingQuoteIndex = dataFlagPattern.lastIndex;
      const closingQuoteIndex = this.findClosingSingleQuote(
        normalized,
        openingQuoteIndex,
      );

      if (closingQuoteIndex === -1) {
        break; // No valid closing quote found
      }

      // Extract and escape the content between quotes
      const content = normalized.slice(openingQuoteIndex, closingQuoteIndex);
      const escapedContent = this.escapeInternalApostrophes(content);

      // Build result with escaped content
      result +=
        normalized.slice(lastProcessedIndex, openingQuoteIndex) +
        escapedContent +
        "'";
      lastProcessedIndex = closingQuoteIndex + 1;
    }

    // Return original if no matches were found
    if (lastProcessedIndex === 0) {
      return normalized;
    }

    // Append remaining command after last match
    result += normalized.slice(lastProcessedIndex);
    return result;
  }

  /**
   * Finds the closing single quote for a data payload, skipping internal apostrophes
   */
  private findClosingSingleQuote(command: string, startIndex: number): number {
    let searchIndex = startIndex;

    while (searchIndex < command.length) {
      const quotePosition = command.indexOf("'", searchIndex);

      if (quotePosition === -1) {
        break; // No more quotes found
      }

      // Check if this quote is followed by a flag or end of command
      const afterQuote = command.slice(quotePosition + 1);
      const isClosingQuote = /^\s*(?:--|-[A-Za-z]|$)/.test(afterQuote);

      if (isClosingQuote) {
        return quotePosition;
      }

      searchIndex = quotePosition + 1;
    }

    return -1; // No closing quote found
  }

  /**
   * Escapes apostrophes within a single-quoted string
   */
  private escapeInternalApostrophes(content: string): string {
    return content.replace(/'(?!\\'')/g, "'\\''");
  }
}
