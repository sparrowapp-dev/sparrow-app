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
  class="select-environment-popup bg-tertiary-700 d-flex p-3 rounded"
  style="
    top:{environmentAxisY}px;
    left:{environmentAxisX}px;
    "
>
  <div
    class="left-panel pe-2 w-100"
    id="left-panel-environment"
    bind:this={scrollPosition}
  >
    {#if filterData.filter((elem) => {
      return elem.type === "E";
    }).length > 0}
      <p class="text-fs-12 mb-2">ENVIRONMENT VARIABLES</p>
    {/if}
    {#each filterData as mock, index}
      {#if mock.type === "E"}
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
          <div class="d-flex mb-1 align-items-center border-radius-2">
            <div
              class="ms-1 d-flex align-items-center justify-content-center"
              style="height:22px; width:22px;"
            >
              <div
                class="h-100 w-100 d-flex align-items-center border-radius-2 justify-content-center local-environment"
              >
                <span class={"text-secondary-100 fw-bold text-fs-16"}
                  >{mock.type}</span
                >
              </div>
            </div>
            <div
              style="height: 33px;"
              class="p-0 d-flex flex-column justify-content-center w-100 ps-2"
            >
              <p
                class="text-fs-11 text-secondary-100 m-0 p-0 env-value word-break"
                style="margin-bottom:2px; "
              >
                {mock.key}
              </p>
              {#if mock.value}
                <p
                  class="text-fs-9 text-secondary-300 m-0 p-0 env-value word-break"
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
      <p class="text-fs-12 mt-2 mb-2">GLOBAL VARIABLES</p>
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
        <div class="d-flex mb-1 align-items-center border-radius-2">
          <div
            class="ms-1 d-flex align-items-center justify-content-center"
            style="height:22px; width:22px;"
          >
            <div
              class="h-100 w-100 d-flex align-items-center border-radius-2 justify-content-center global-environment"
            >
              <span class={"text-secondary-100 fw-bold text-fs-16"}
                >{mock.type}</span
              >
            </div>
          </div>
          <div
            style="height: 33px;"
            class="p-0 d-flex flex-column justify-content-center w-100 ps-2"
          >
            <p
              class="text-fs-11 text-secondary-100 m-0 p-0 env-value word-break"
            >
              {mock.key}
            </p>
            {#if mock.value}
              <p
                class="text-fs-9 text-secondary-300 m-0 p-0 env-value word-break"
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
    width: 394px;
    height: 168px;
    position: fixed;
    z-index: 900;
    flex-wrap: wrap;
  }
  .select-environment-popup .left-panel {
    height: 138px;
    overflow-y: auto;
  }
  .global-environment {
    background-color: #3670f7;
  }
  .local-environment {
    background-color: #69d696;
  }
  .env-value {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 1; /* Number of lines to show */
    text-overflow: ellipsis;
    white-space: normal; /* Use 'normal' instead of 'nowrap' */
  }
  .env-item:hover {
    background-color: var(--bg-tertiary-400);
  }
  .word-break {
    word-break: break-all;
  }
</style>
