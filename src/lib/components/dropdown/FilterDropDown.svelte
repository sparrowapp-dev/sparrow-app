<script lang="ts">
  import angleDown from "$lib/assets/dropdown.svg";
  import angleUp from "$lib/assets/angle-up-2.svg";
  import plus from "$lib/assets/white-plus.svg";
  import close from "$lib/assets/close.svg";
  import { selectMethodsStore, showPathStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";
  import { slide } from "svelte/transition";
  export let handleSearch;
  let newTabs = [];
  let showMethods = false;

  const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
    if (value) {
      newTabs = value;
    }
  });

  function addInSelectedMethods(event: any, id: string) {
    const methodType = event.currentTarget.innerText;
    const methodItemButton = document.getElementById(id) as HTMLButtonElement;
    const methodAddButton = document.getElementById(
      id + "ADD",
    ) as HTMLImageElement;
    if (methodItemButton.classList.contains("selected")) {
      methodItemButton.style.backgroundColor = "transparent";
      methodItemButton.style.color = "";
      methodAddButton.src = plus;
      methodAddButton.style.width = "16px";
      methodItemButton.classList.remove("selected");
      const filterTabs = newTabs.filter((item) => {
        return item !== methodType;
      });
      selectMethodsStore.update(() => filterTabs);
    } else {
      methodItemButton.style.backgroundColor = "#2196f3";
      methodAddButton.style.color = "#000000";
      methodItemButton.style.color = "#000000";
      methodAddButton.src = close;
      methodAddButton.style.width = "22px";
      methodItemButton.classList.add("selected");
      newTabs.push(methodType);
      selectMethodsStore.update(() => newTabs);
    }
    handleSearch();
  }
  function showPaths(id: string) {
    const isShowPathChecked = (document.getElementById(id) as HTMLInputElement)
      .checked;
    if (isShowPathChecked) {
      showPathStore.update(() => true);
    } else {
      showPathStore.update(() => false);
    }
  }

  function handleHover(id: string, show: boolean) {
    const methodItemButton = document.getElementById(id) as HTMLButtonElement;
    if (show) {
      methodItemButton.style.backgroundColor = "#2196f3";
      methodItemButton.style.color = "#000000";
    } else {
      if (!methodItemButton.classList.contains("selected")) {
        methodItemButton.style.backgroundColor = "transparent";
        methodItemButton.style.color = "";
      }
    }
  }
  onDestroy(() => {
    selectedMethodUnsubscibe();
  });
</script>

<div class="px-3" transition:slide>
  <div class="show-url">
    <p>Show Paths</p>
    <label class="switch">
      <input
        type="checkbox"
        id="showPath"
        on:change={() => {
          showPaths("showPath");
        }}
      />
      <span class="slider round"></span>
    </label>
  </div>
  <div class="filter-by-methods">
    <div class="methods-header">
      <p style="font-size: 14px;">Filter By Methods</p>
      <span
        class="dropdown-active"
        on:click={() => {
          showMethods = !showMethods;
          if (!showMethods) {
            selectMethodsStore.update(() => []);
            handleSearch();
          }
        }}><img src={showMethods ? angleUp : angleDown} alt="angledown" /></span
      >
    </div>
    {#if showMethods}
      <div class="all-methods" transition:slide>
        <button
          class="method-button green-api"
          id="GET"
          on:mouseenter={() => {
            handleHover("GET", true);
          }}
          on:mouseleave={() => {
            handleHover("GET", false);
          }}
          on:click={(event) => {
            addInSelectedMethods(event, "GET");
          }}>GET<img class="plus" id="GETADD" src={plus} alt="+" /></button
        >
        <button
          class="method-button yellow-api"
          id="POST"
          on:mouseenter={() => {
            handleHover("POST", true);
          }}
          on:mouseleave={() => {
            handleHover("POST", false);
          }}
          on:click={(event) => {
            addInSelectedMethods(event, "POST");
          }}>POST<img class="plus" id="POSTADD" src={plus} alt="+" /></button
        >
        <button
          class="method-button blue-api"
          id="PUT"
          on:mouseenter={() => {
            handleHover("PUT", true);
          }}
          on:mouseleave={() => {
            handleHover("PUT", false);
          }}
          on:click={(event) => {
            addInSelectedMethods(event, "PUT");
          }}>PUT<img class="plus" id="PUTADD" src={plus} alt="+" /></button
        >
        <button
          class="method-button pink-api"
          id="PATCH"
          on:mouseenter={() => {
            handleHover("PATCH", true);
          }}
          on:mouseleave={() => {
            handleHover("PATCH", false);
          }}
          on:click={(event) => {
            addInSelectedMethods(event, "PATCH");
          }}>PATCH<img class="plus" id="PATCHADD" src={plus} alt="+" /></button
        >
        <button
          class="method-button red-api"
          id="DELETE"
          on:mouseenter={() => {
            handleHover("DELETE", true);
          }}
          on:mouseleave={() => {
            handleHover("DELETE", false);
          }}
          on:click={(event) => {
            addInSelectedMethods(event, "DELETE");
          }}
          >DELETE<img class="plus" id="DELETEADD" src={plus} alt="+" /></button
        >
      </div>
    {/if}
  </div>
</div>

<style>
  .all-methods {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
  .plus {
    margin-left: 3px;
    width: 16px;
    height: 25px;
  }
  .red-api {
    color: var(--request-delete);
  }
  .green-api {
    color: var(--request-get);
  }
  .yellow-api {
    color: var(--request-post);
  }
  .blue-api {
    color: var(--request-put);
  }
  .pink-api {
    color: var(--request-patc);
  }

  .method-button {
    display: flex;
    height: 24px;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    font-size: 12px;
    border-radius: 6px;
    text-align: left;
  }

  .method-button > span {
    font-family: Roboto;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    font-variation-settings: "slnt" 0;
  }

  .show-url,
  .methods-header {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }
  .switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    top: 2px;
    bottom: 4px;
    background-color: var(--white-color);
    -webkit-transition: 0.1s;
    transition: 0.1s;
  }

  input:checked + .slider {
    background-color: #85c2ff;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(15px);
    -ms-transform: translateX(15px);
    transform: translateX(15px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }

  .dropdown-active {
    cursor: pointer;
  }
</style>
