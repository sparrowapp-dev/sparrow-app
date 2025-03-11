<script lang="ts">
  /**
   * environemt variables filtered data
   */
  export let filterData = [];
  /**
   * search text for environment variables
   */
  export let inputText;
  /**
   * track cursor and paranthesis position
   */
  export let trackCursor: number;
  export let trackParanthesis;
  /**
   * on change event for input
   */
  export let handleInputValue = () => {};
  export let updateText;
  /**
   * tracks environment dialog box position
   */
  export let environmentAxisX: number;
  export let environmentAxisY: number;

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
  class="select-environment-popup d-flex"
  style="
    top:{environmentAxisY}px;
    left:{environmentAxisX}px;
    "
>
  <div
    class="left-panel w-100"
    id="left-panel-environment"
    bind:this={scrollPosition}
  >
    {#if filterData.filter((elem) => {
      return elem.type === "E";
    }).length > 0}
      <div class="variable-heading mb-2">ENVIRONMENT VARIABLES</div>
    {/if}
    {#each filterData as mock, index}
      {#if mock.type === "E"}
        <div
          role="button"
          class="env-item border-radius-1"
          on:click={() => {
            const preUrl = inputText?.substring(0, trackParanthesis[0]);
            const postUrl = inputText?.substring(trackCursor, inputText.length);
            updateText(preUrl + "{{" + mock.key + "}}" + postUrl);
            handleInputValue();
          }}
        >
          <div
            class="d-flex align-items-center border-radius-2"
            style="padding:4px 6px 4px 8px;"
          >
            <div
              class=" d-flex align-items-center justify-content-center"
              style="height:28px; width:30px;"
            >
              <div
                class="h-100 w-100 d-flex align-items-center border-radius-2 justify-content-center local-environment"
              >
                <span class={"icon-text"}
                  >{mock.type}</span
                >
              </div>
            </div>
            <div
              style="height: 33px;"
              class="p-0 d-flex flex-column justify-content-center w-100 ps-2"
            >
              <p
                class="mock-key m-0 p-0 env-value word-break"
                style="margin-bottom:2px; "
              >
                {mock.key}
              </p>
              {#if mock.value}
                <p
                  class="mock-value m-0 p-0 env-value word-break"
                >
                  {mock.value}
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/each}
    {#if filterData.filter((elem) => {
      return elem.type === "G";
    }).length > 0}
      <div class="variable-heading mb-2" style="margin-top:12px;">
        GLOBAL VARIABLES
      </div>
    {/if}

    {#each filterData.filter((elem) => {
      return elem.type === "G";
    }) as mock, index}
      <div
        role="button"
        class="env-item border-radius-2"
        on:click={() => {
          const preUrl = inputText?.substring(0, trackParanthesis[0]);
          const postUrl = inputText?.substring(trackCursor, inputText.length);
          updateText(preUrl + "{{" + mock.key + "}}" + postUrl);
          handleInputValue();
        }}
      >
        <div
          class="d-flex align-items-center border-radius-2"
          style="padding:4px 6px 4px 8px;"
        >
          <div
            class="d-flex align-items-center justify-content-center"
            style="height:28px; width:31px;"
          >
            <div
              class="d-flex align-items-center border-radius-2 justify-content-center global-environment"
            >
              <span class={"icon-text"}
                >{mock.type}</span
              >
            </div>
          </div>
          <div
            style="height: 33px;"
            class="p-0 d-flex flex-column justify-content-center w-100 ps-2"
          >
            <p
              class="mock-key m-0 p-0 env-value word-break"
            >
              {mock.key}
            </p>
            {#if mock.value}
              <p
                class="mock-value m-0 p-0 env-value word-break"
              >
                {mock.value}
              </p>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .select-environment-popup {
    width: 252px;
    height: fit-content;
    max-height: 348px;
    position: fixed;
    z-index: 900;
    flex-wrap: wrap;
    background-color: var(--bg-ds-surface-600);
    padding: 12px;
    border-radius: 4px;
  }
  .select-environment-popup .left-panel {
    height: 100%;
    max-height: 324px;
    overflow-y: auto;
  }
  .global-environment {
    background-color: var(--bg-ds-primary-500);
    border: 1px solid var(--border-ds-surface-50);
    padding: 4px;
    width: 100%;
    height: 100%;
  }
  .local-environment {
    background-color: var(--bg-ds-success-500);
    border: 1px solid var(--border-ds-surface-50);
    padding: 4px;
    width: 100%;
    height: 100%;
  }
  .env-value {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 1; /* Number of lines to show */
    text-overflow: ellipsis;
    white-space: normal; /* Use 'normal' instead of 'nowrap' */
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: var(--text-ds-neutral-50);
  }

  .env-item:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .env-item:active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .env-item:focus-visible {
    border-radius: 4px;
    border: 2px solid var(--border-ds-primary-300);
    outline: none;
  }

  .word-break {
    word-break: break-all;
  }
  .variable-heading {
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    color: var(--text-ds-neutral-50);
  }
  .icon-text{
    font-size: 14px;
    font-weight: 500;
    color: var(--text-ds-neutral-50);
  }
  .mock-value{
    font-size: 12px;
    font-weight: 400;
    color: var(--text-ds-neutral-300);
  }
  .mock-key{
    font-size: 12px;
    font-weight: 500;
    color: var(--text-ds-neutral-50);
  }
</style>
