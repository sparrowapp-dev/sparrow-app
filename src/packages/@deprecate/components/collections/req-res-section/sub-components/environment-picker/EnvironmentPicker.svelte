<script>
  export let filterData = [];
  export let inputText;
  export let trackCursor;
  export let trackParanthesis;
  export let handleInputValue = () => {};
  export let updateText;
  export let environmentAxisX;
  export let environmentAxisY;
  let activeVariable;

  let scrollPosition = 0;
  const scrollTo = (direction) => {
    const container = document.getElementById("left-panel-environment");
    if (container) {
      if (direction === "bottom") {
        container.scrollTop += 10;
      } else {
        container.scrollTop -= 10;
      }
      scrollPosition = container.scrollTop;
    }
  };
  const handleKeyPress = (event) => {
    if (
      activeVariable === undefined &&
      (event.key === "ArrowDown" || event.key === "ArrowUp")
    ) {
      activeVariable = 0;
    } else if (event.key === "ArrowDown") {
      if (activeVariable >= filterData.length - 1) {
        activeVariable = filterData.length - 1;
      } else {
        scrollTo("bottom");
        activeVariable++;
      }
    } else if (event.key === "ArrowUp") {
      if (activeVariable <= 0) {
        activeVariable = 0;
      } else {
        activeVariable--;
        scrollTo("top");
      }
    }
    if (event.key === "Enter") {
      const preUrl = inputText?.substring(0, trackParanthesis[0]);
      const postUrl = inputText?.substring(trackCursor, inputText.length);
      updateText(
        preUrl + "{{" + filterData[activeVariable].key + "}}" + postUrl,
      );
      handleInputValue();
    }
  };
</script>

<div
  class="select-environment-popup d-flex p-3 rounded"
  style="
  top:{environmentAxisY}px;
  left:{environmentAxisX}px;
  "
>
  <div
    class="left-panel pe-2 w-50"
    id="left-panel-environment"
    bind:this={scrollPosition}
  >
    {#each filterData as mock, index}
      <div
        class={activeVariable === index
          ? "bg-dullBackground rounded"
          : "rounded"}
        on:mouseenter={() => {
          activeVariable = index;
        }}
      >
        <p
          class="variable-title mb-0 ellipsis"
          on:click={() => {
            const preUrl = inputText?.substring(0, trackParanthesis[0]);
            const postUrl = inputText?.substring(trackCursor, inputText.length);
            updateText(preUrl + "{{" + mock.key + "}}" + postUrl);
            handleInputValue();
          }}
        >
          <span
            class={mock.type === "G"
              ? "global-environment"
              : "local-environment"}>{mock.type}</span
          >
          <span>{mock.key}</span>
        </p>
      </div>
    {/each}
  </div>
  <div
    class="right-panel ps-2 w-50 {activeVariable === undefined
      ? 'd-flex align-items-center justify-content-center ps-3 pe-3'
      : ''}"
  >
    {#if activeVariable === undefined}
      <p class="default-environment">
        use arrow keys or hover on a variable to see details
      </p>
    {:else}
      <p class="env-title mb-0">ENVIRONMENT</p>
      <p class="env-value">
        {filterData[activeVariable]?.environment}
      </p>
      <p class="env-title mb-0">VALUE</p>
      <p class="env-value">
        {filterData[activeVariable]?.value}
      </p>
    {/if}
  </div>
  <div class="w-100">
    <p class="select-env-info mb-0">
      showing <span class="text-whiteColor">Dev</span> environment variables and
      <span class="text-whiteColor">Global</span> variables
    </p>
  </div>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .select-environment-popup {
    width: 400px;
    height: 250px;
    position: fixed;
    /* transform: translateX(-50%); */
    background-color: var(--background-dropdown);
    z-index: 5;
    flex-wrap: wrap;
    border: 1px solid var(--border-color);
  }
  .select-environment-popup .left-panel {
    height: 190px;
    overflow-y: auto;
  }
  .select-environment-popup .right-panel {
    height: 190px;
  }
  .variable-title {
    font-size: 12px;
    font-weight: 400;
    padding: 4px 8px 4px 4px;
    color: white;
  }
  .global-environment {
    color: #58c6b9;
  }
  .local-environment {
    color: #df77f9;
  }
  .select-env-info {
    font-size: 12px;
    color: #999999;
    margin-top: 10px;
  }
  .env-title {
    color: #999999;
    font-size: 12px;
  }
  .env-value {
    font-size: 12px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 3; /* Number of lines to show */
    text-overflow: ellipsis;
    white-space: normal; /* Use 'normal' instead of 'nowrap' */
    color: white;
  }
  .default-environment {
    font-size: 10px;
    text-align: center;
    color: #999999;
  }
</style>
