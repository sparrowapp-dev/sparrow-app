export const copyToClipBoard = (text: string): Promise<void> | void => {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else if (document.queryCommandSupported?.("copy")) {
    const textarea = document.createElement("textarea");
    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();

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
};
