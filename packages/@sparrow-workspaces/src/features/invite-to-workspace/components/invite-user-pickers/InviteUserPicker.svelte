<script lang="ts">
  import { closeIconIcon as closeIcon } from "@sparrow/library/assets";
  import { closeIconWhiteIcon as closeIconWhite } from "@sparrow/library/assets";
  import { createDynamicComponents } from "@sparrow/common/utils/common.helper";
  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import type { List } from "../../types";
  import { Avatar } from "@sparrow/library/ui";

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

  /**
   * List of current workspace users to check for duplicates
   */
  export let currentWorkspaceUsers: { email: string }[] = [];

  // State variables
  let isOpen = false;
  let data = list;
  let emailstoBeSentArr: string[] = [];
  let currentEmailEntered = "";
  let invalidEmails: Set<string> = new Set();

  /**
   * Validates if an email is valid (exists in list and not already in workspace)
   */
  const validateEmail = (email: string): boolean => {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      return false;
    }
    const isInWorkspace = currentWorkspaceUsers.some(
      (user) => user.email === trimmedEmail,
    );
    if (isInWorkspace) {
      return false;
    }
    return true;
  };

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Updates the invalid emails set and triggers parent onChange
   */
  const updateInvalidEmails = () => {
    invalidEmails.clear();
    emailstoBeSentArr.forEach((email) => {
      if (!validateEmail(email)) {
        invalidEmails.add(email);
      }
    });
    invalidEmails = invalidEmails;
    onChange(emailstoBeSentArr);
  };

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
    if (currentEmailEntered) {
      data = [
        ...data,
        {
          email: currentEmailEntered,
          name: currentEmailEntered,
        },
      ];
    }
  };

  /**
   * Handles the addition of an email to the list of emails to be sent.
   * @param email - The email to be added.
   */
  const handleEmailOnAdd = (email: string) => {
    email = email.replace(",", "");
    email = email.trim();
    // Check if email already exists in the array
    if (emailstoBeSentArr.includes(email)) {
      return;
    }
    emailstoBeSentArr = [...emailstoBeSentArr, email];
    const isValid = validateEmail(email);
    if (!isValid) {
      invalidEmails.add(email);
      invalidEmails = invalidEmails;
    }

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
    // Add red color for invalid emails
    if (!isValid) {
      emailContentSpan.style.color = "var(--text-ds-danger-300)";
    }
    emailDiv.appendChild(emailContentSpan);
    emailDiv.appendChild(closeIconBtn);
    const emailContainer: HTMLElement = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.appendChild(emailDiv);
    currentEmailEntered = "";
    updateInvalidEmails();
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
    // Remove from invalid emails set
    invalidEmails.delete(email);
    invalidEmails = invalidEmails;
    updateInvalidEmails();
    filterUser();
  };

  /**
   * Handle keyboard events for adding emails
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (currentEmailEntered.trim()) {
        handleEmailOnAdd(currentEmailEntered);
        isOpen = false;
        filterUser();
      }
    }
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
            ? "Enter email ID or name of hub member."
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
          on:keydown={handleKeyDown}
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
                <div style="width: 10%;" class="me-2">
                  <Avatar
                    type="letter"
                    size="large"
                    letter={user.name ? user.name[0] : user.email[0]}
                    bgColor="var(--text-tertiary-500)"
                  />
                </div>
                <div class="name pl-1 ellipsis" style="width: 90%;">
                  <span class="sparrow-fs-12 text-whiteColor w-100 ellipsis"
                    >{user.name || user.email}</span
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
    background-color: var(--bg-ds-surface-400);
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
