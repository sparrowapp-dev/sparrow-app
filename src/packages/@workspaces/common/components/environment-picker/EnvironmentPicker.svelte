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
          <div class="d-flex border-radius-2">
            <div
              class="d-flex align-items-center justify-content-center p-1"
              style="height:33px; width:33px;"
            >
              <div
                class="h-100 w-100 d-flex align-items-center justify-content-center local-environment"
              >
                <span class={"text-secondary-100 text-fs-12"}>{mock.type}</span>
              </div>
            </div>
            <div
              style="height: 33px;"
              class="p-0 d-flex flex-column w-100 ps-2"
            >
              <span class="text-fs-11 text-secondary-100 m-0 p-0"
                >{mock.key}</span
              >
              <p class="text-fs-11 text-secondary-300 m-0 p-0">
                {mock.value}
              </p>
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
        <div class="d-flex border-radius-2">
          <div
            class="d-flex align-items-center justify-content-center p-1"
            style="height:33px; width:33px;"
          >
            <div
              class="h-100 w-100 d-flex align-items-center justify-content-center global-environment"
            >
              <span class={"global-environment text-secondary-100 text-fs-12"}
                >{mock.type}</span
              >
            </div>
          </div>
          <div style="height: 33px;" class="p-0 d-flex flex-column w-100 ps-2">
            <span class="text-fs-11 text-secondary-100 m-0 p-0">{mock.key}</span
            >
            <p class="text-fs-11 text-secondary-300 m-0 p-0">
              {mock.value}
            </p>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .select-environment-popup {
    width: 400px;
    height: 250px;
    position: fixed;
    /* transform: translateX(-50%); */
    /* background-color: var(--background-dropdown); */
    z-index: 5;
    flex-wrap: wrap;
    /* border: 1px solid var(--border-color); */
  }
  .select-environment-popup .left-panel {
    height: 220px;
    overflow-y: auto;
  }
  .select-environment-popup .right-panel {
    height: 190px;
  }
  .variable-title {
    font-size: 12px;
    font-weight: 400;
    color: white;
  }
  .global-environment {
    background-color: #3670f7;
  }
  .local-environment {
    background-color: #69d696;
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
  .env-item:hover {
    background-color: var(--bg-tertiary-400);
  }
</style>
