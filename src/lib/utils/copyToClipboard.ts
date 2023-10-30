export default function copyToClipBoard(text: string): Promise<void> | void {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Compatible with old browsers such as Chrome <=65, Edge <=18 & IE
  // Compatible with HTTP
  else if (document.queryCommandSupported?.("copy")) {
    const textarea = document.createElement("textarea");
    textarea.value = text;

    textarea.style.position = "fixed"; // Avoid scrolling to bottom
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();

    // Security exception may be thrown by some browsers
    try {
      document.execCommand("copy");
    } catch (e) {
      console.error(e);
    } finally {
      document.body.removeChild(textarea);
    }
  } else {
    console.error("Copy failed.");
  }
}
