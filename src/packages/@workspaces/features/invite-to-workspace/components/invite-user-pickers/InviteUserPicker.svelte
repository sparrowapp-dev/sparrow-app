<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";
  import closeIcon from "$lib/assets/close-icon-normal.svg";
  import closeIconWhite from "$lib/assets/close-icon-white.svg";
  import { createDynamicComponents } from "$lib/utils/helpers/common.helper";
  import { validateEmail } from "$lib/utils/helpers";
  import { onDestroy, onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  let isOpen = false;
  export let isError = false;
  export let list = [];
  export let showErrors;
  export let id;
  export let onChange;
  let data = list;
  let emailstoBeSentArr: string[] = [];

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(`input-select-list-${id}`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      setTimeout(() => {
        isOpen = false;
      }, 100);
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
  let currentEmailEntered = "";

  const filterUser = () => {
    data = list
      .filter((element) => {
        if (
          element.email.includes(currentEmailEntered) ||
          element.name
            ?.toLowerCase()
            .includes(currentEmailEntered?.toLowerCase())
        ) {
          return true;
        }
        return false;
      })
      .filter((element) => {
        if (emailstoBeSentArr?.includes(element.email)) {
          return false;
        }
        return true;
      });
  };
  const handleEmailOnAdd = (email: string) => {
    email = email.replace(",", "");
    email = email.trim();
    emailstoBeSentArr = [...emailstoBeSentArr, email];
    onChange(emailstoBeSentArr);

    const emailDiv: HTMLElement = createDynamicComponents(
      "div",
      `d-flex bg-emailInviteBackgroundColor sparrow-fs-12 gx-1 px-1 justify-content-center rounded-1 align-items-center`,
    );
    const emailContentSpan = createDynamicComponents("span", "");
    const closeIconBtn = createDynamicComponents("img", "bg-transparent", [
      { eventType: "click", eventHandler: removeElement },
      {
        eventType: "mouseleave",
        eventHandler: () => {
          closeIconBtn.src = closeIcon;
        },
      },
      {
        eventType: "mouseenter",
        eventHandler: () => {
          closeIconBtn.src = closeIconWhite;
        },
      },
    ]) as HTMLImageElement;
    emailDiv.id = email;
    closeIconBtn.id = email;
    closeIconBtn.src = closeIcon;
    emailContentSpan.innerHTML = email;
    emailDiv.appendChild(emailContentSpan);
    emailDiv.appendChild(closeIconBtn);
    const emailContainer: HTMLElement = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.appendChild(emailDiv);
    currentEmailEntered = "";
  };

  function removeElement(event: Event): void {
    const email = event.target?.id;
    const removeElement = document.getElementById(email) as HTMLElement;
    const emailContainer = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.removeChild(removeElement);
    emailstoBeSentArr = emailstoBeSentArr?.filter((e) => e != email);
    onChange(emailstoBeSentArr);
    filterUser();
  }
</script>

<div on:click={handleDropdownClick}>
  <div
    id={`input-select-list-${id}`}
    class="parent-dropdown display-inline-block z-1"
    style=" position: relative;"
  >
    <div>
      <div class="email-container rounded d-flex flex-wrap">
        <div
          id="input-email"
          class="d-flex align-items-start flex-wrap gap-2"
        ></div>
        <input
          id="input"
          placeholder={!emailstoBeSentArr.length
            ? "Enter email ID or name of team member."
            : ""}
          autocomplete="off"
          autocapitalize="none"
          style="outline:none;border:none;flex-grow:1; background:transparent;"
          bind:value={currentEmailEntered}
          on:input={() => {
            filterUser();
          }}
          on:focus={() => {
            isOpen = true;
          }}
          class="input-container mt-2 sparrow-fs-12 my-1"
        />
      </div>
    </div>

    {#if isOpen}
      <div
        class="d-none select-data p-1 rounded"
        class:select-active={isOpen}
        transition:slide={{ duration: 100 }}
      >
        {#each data as user, index}
          <div
            class="d-flex w-100 px-2 py-2 highlight rounded"
            on:click={() => {
              handleEmailOnAdd(user.email);
              isOpen = false;
              filterUser();
            }}
          >
            <div class="d-flex tile w-100 rounded align-items-center">
              <div class="info d-flex align-items-center w-100">
                <div
                  class="icon d-flex align-items-center justify-content-center"
                >
                  <span>{user.name[0].toUpperCase()}</span>
                </div>
                <div class="name px-2 ellipsis">
                  <span class="sparrow-fs-12 text-whiteColor w-100 ellipsis"
                    >{user.name || ""}</span
                  ><br />
                  <span class="sparrow-fs-12 text-textColor w-100 ellipsis"
                    >{user.email}</span
                  >
                </div>
              </div>
            </div>
          </div>
        {/each}
        {#if !data?.length}
          <p class="sparrow-fs-12 m-0 ps-2 p-0 pt-1 pb-1 text-whiteColor">
            {"No members found!"}
          </p>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .email-container {
    background-color: transparent;
    border: 1px solid;
    padding: 3px 8px 3px 8px;
    border: 1px solid var(--border-color);
    max-height: calc(100px);
    overflow-y: auto;
  }
  .select-data {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    position: absolute;
    bottom: 0px;
    left: 0;
    right: 0;
    transform: translateY(100%);
    border: 1px solid rgb(44, 44, 44);
    max-height: calc(200px);
    overflow-y: auto;
    -webkit-backdrop-filter: blur(10px); /* For some older versions of Safari */
    backdrop-filter: blur(10px);
  }
  .select-active {
    display: block !important;
  }
  .highlight {
    cursor: pointer;
  }
  .highlight:hover {
    background-color: var(--dull-background-color);
  }

  .icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border-color) !important;
  }
  .info {
    width: calc(100% - 120px);
    height: 48px;
    padding: 8px !important;
  }
</style>
