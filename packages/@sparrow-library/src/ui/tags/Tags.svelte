<script lang="ts">
export let type: 'cyan' | 'purple' | 'yellow' | 'green' | 'orange' | 'grey' | 'pink' = 'grey';
export let text: string = 'Tag';

 const convertCasing = (sentence: string) => {
    let sen =
      sentence?.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    let total_words = sen.split(" ");
    if (total_words.length > 5) sen = total_words.slice(0, 5).join(" ") + "...";
    return sen;
  };

const colorPalette = {
    "cyan": {
        "text": "var(--text-ds-info-300)",
        "bg": "var(--text-ds-info-900)",
        "border": "var(--text-ds-info-700)"
    },
    "purple": {
        "text": "var(--text-ds-secondary-200)",
        "border": "var(--text-ds-secondary-700)",
        "bg": "var(--text-ds-secondary-900)"
    },
    "yellow": {
        "bg": "var(--bg-ds-warning-900)",
        "text": "var(--bg-ds-warning-300)",
        "border": "var(--bg-ds-warning-700)"
    },
    "green": {
        "bg": "var(--bg-ds-success-900)",
        "text": "var( --bg-ds-success-300)",
        "border": "var(--bg-ds-success-700)"
    },
    "orange": {
        "bg": "var(--bg-ds-tertiary-900)",
        "text": "var(--bg-ds-tertiary-300)",
        "border": "var(--bg-ds-tertiary-700)"
    },
    "grey": {
        "bg": "var(--bg-ds-neutral-900)",
        "text": "var(--bg-ds-neutral-300)",
        "border": "var(--bg-ds-neutral-700)"
    },
    "pink": {
        "bg": "var(--text-ds-accent-900)",
        "text": "var(--text-ds-accent-300)",
        "border": "var(--text-ds-accent-700)"
    }
}
</script>

<button style="
    background-color: {colorPalette[type].bg};
    color: {colorPalette[type].text};
    border: 1px solid {colorPalette[type].border};
    border-radius: 2px;
    padding: 0px 4px;
    height: 18px;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    font-weight: 500;
    font-family: Inter, sans-serif;
    width: fit-content;
    max-width: 188px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;"
    >
    {convertCasing(text)}
</button>