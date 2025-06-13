<script lang="ts">
  export let plan: "community" | "standard" | "professional" = "community";
  export let text: string = "";
  export let size: "small" | "medium" = "small";
  let height = size === "medium" ? 20 : 18;

  // Color palette for each plan
  const planPalette = {
    community: {
      bg: "#2A2C32",
      border: "#62656A",
      text: "#B6B7B9",
    },
    standard: {
      bg: "#110D2E",
      border: "#2C2073",
      text: "#A394FF",
    },
    professional: {
      bg: "#0F2024",
      border: "#214D5E",
      text: "#5EC5ED",
    },
  };

  // Capitalize first letter
  const formatPlan = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
</script>

<button
  style="
    background-color: {planPalette[plan].bg};
    color: {planPalette[plan].text};
    border: 1px solid {planPalette[plan].border};
    border-radius: 4px;
    padding: 2px 4px;
    height: {height}px;
    text-align: center;
    font-family: Inter, sans-serif;
    width: fit-content;
    max-width: 188px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 500;
    line-height: 150%;
    display: flex;
    align-items: center;
    justify-content: center;
  "
  title={text || formatPlan(plan)}
>
  {formatPlan(plan)}
</button>
