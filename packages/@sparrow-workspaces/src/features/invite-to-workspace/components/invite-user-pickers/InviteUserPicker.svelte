<script lang="ts">
  import { closeIconIcon as closeIcon } from "@sparrow/library/assets";
  import { closeIconWhiteIcon as closeIconWhite } from "@sparrow/library/assets";
  import { createDynamicComponents } from "@sparrow/common/utils/common.helper";
  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import type { List } from "../../types";

  /**
   *  List of users
   * */
  export let list: List[] = [];

  /**
   * Unique identifier for the component
   * */
  export let id: string = "";

  /**
   * Callback function to notify parent component of email changes
   */
  export let onChange: (emails: string[]) => void;

  /**
   * shows picker in error state
   */
  export let isError: boolean = false;

  // State variables
  let isOpen = false;
  let data = list;
  let emailstoBeSentArr: string[] = [];
  let currentEmailEntered = "";

  /**
   * Handles click events outside the dropdown to close it.
   * @param event - The mouse event.
   */
  const handleDropdownClick = (event: MouseEvent) => {
    const dropdownElement = document.getElementById(`input-select-list-${id}`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      setTimeout(() => {
        isOpen = false;
      }, 100);
    }
  };

  // Lifecycle hook to add and remove event listeners
  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });

  /**
   * Filters the user list based on the current input and already selected emails.
   */
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

  /**
   * Handles the addition of an email to the list of emails to be sent.
   * @param email - The email to be added.
   */
  const handleEmailOnAdd = (email: string) => {
    email = email.replace(",", "");
    email = email.trim();
    emailstoBeSentArr = [...emailstoBeSentArr, email];
    onChange(emailstoBeSentArr);

    const emailDiv: HTMLElement = createDynamicComponents(
      "div",
      `d-flex bg-tertiary-750 sparrow-fs-12 gx-1 px-1 justify-content-center ps-2 me-1 rounded-1 align-items-center`,
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

  /**
   * Removes an email from the list of emails to be sent.
   * @param  event - The event triggered by clicking the remove button.
   */
  const removeElement = (event: Event) => {
    const email = (event.target as HTMLElement)?.id;
    const removeElement = document.getElementById(email) as HTMLElement;
    const emailContainer = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.removeChild(removeElement);
    emailstoBeSentArr = emailstoBeSentArr?.filter((e) => e != email);
    onChange(emailstoBeSentArr);
    filterUser();
  };
</script>

<div on:click={handleDropdownClick}>
  <div
    id={`input-select-list-${id}`}
    class="parent-dropdown display-inline-block z-1 border-radius-4 {isError
      ? 'selectErrorBorderClass'
      : ''}
    
    "
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
          class="input-container mt-1 sparrow-fs-12 my-1"
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
              <div class="info d-flex align-items-center w-100 ellipsis">
                <div style="width: 10%;">
                  <div
                    class="icon d-flex align-items-center justify-content-center ellipsis"
                  >
                    <span>{user.name[0].toUpperCase()}</span>
                  </div>
                </div>
                <div class="name pl-1 ellipsis" style="width: 90%;">
                  <span class="sparrow-fs-12 text-whiteColor w-100 ellipsis"
                    >{user.name || ""}</span
                  ><br />
                  <span class="sparrow-fs-12 text-secondary-200 w-100 ellipsis"
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
    background-color: var(--bg-tertiary-300);
    border: 1px solid;
    padding: 3px 8px 3px 8px;
    border: 1px solid var(--border-secondary-400);
    max-height: calc(100px);
    overflow-y: auto;
  }
  .select-data {
    background-color: var(--bg-tertiary-300);
    color: white;
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    transform: translateY(100%);
    border: 1px solid rgb(44, 44, 44);
    max-height: calc(200px);
    overflow-y: auto;
    -webkit-backdrop-filter: blur(10px); /* For some older versions of Safari */
    backdrop-filter: blur(10px);
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  }
  .select-active {
    display: block !important;
  }
  .highlight {
    cursor: pointer;
  }
  .highlight:hover {
    background-color: var(--bg-tertiary-400);
  }

  .icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border-secondary-300) !important;
    background-color: var(--bg-tertiary-750);
  }
  .info {
    width: calc(100% - 120px);
    height: 48px;
    padding: 8px !important;
  }
  input::placeholder {
    color: var(--text-secondary-200);
  }
  .selectErrorBorderClass {
    border: 1px solid var(--border-danger-200) !important;
  }
</style>
