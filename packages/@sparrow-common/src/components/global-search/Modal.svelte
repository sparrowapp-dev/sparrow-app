<script lang="ts">
  export let collectionName: string = "Pet Hospitality";
  export let workspaceName: string = "Domigo";
  export let onCancel: () => void;
  export let onContinue: () => void;
  import crossIcon from "../../../static/crossIcon.svg";
</script>

<div class="modal">
  <div class="modal-header">
    <div class="header">
      <h2 class="modal-title">Switch to {workspaceName}</h2>
      <button class="close-button" on:click={onCancel} aria-label="Close modal">
        <img src={crossIcon} alt="" class="close-icon" />
      </button>
    </div>
    <p class="modal-message">
      The selected API request/folder/collection belongs to the <span
        class="highlight">{workspaceName}</span
      > workspace.To access this you need to switch workspace. Do you want to continue?
    </p>
  </div>
  <div class="modal-actions">
    <button class="cancel-button" on:click={onCancel} type="button">
      Cancel
    </button>
    <button class="continue-button" on:click={onContinue} type="button">
      Yes, Continue
    </button>
  </div>
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .modal {
    border-radius: 8px;
    background-color: #14181f;
    display: flex;
    max-width: 540px;
    width: 540px;
    height: auto;
    gap: 0px;
    flex-direction: column;
    padding: 24px;
    position: fixed;
    top: 35%;
    left: 30%;
  }

  .modal-header {
    display: flex;
    flex-direction: column;
    /* min-height: 30px; */
    width: 100%;
    align-items: center;
    justify-content: space-between;
    border-bottom: none;
  }

  .modal-title {
    color: var(--colors-neutral-text-0, #ffffff);
    font:
      500 20px Inter,
      sans-serif;
    margin: 0;
    line-height: 30px;
  }

  .close-button {
    border-radius: 4px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .close-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .modal-message {
    color: var(--colors-neutral-text-3, #cccccc);
    margin: 14px 0 0;
    font:
      400 14px Inter,
      sans-serif;
    line-height: 20px;
  }

  .highlight {
    font-weight: 700;
  }

  .modal-actions {
    display: flex;
    padding-top: 16px;
    gap: 8px;
    justify-content: flex-end;
  }

  .cancel-button,
  .continue-button {
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    min-width: 96px;
    font:
      400 16px Roboto,
      sans-serif;
    cursor: pointer;
    line-height: 24px;
  }

  .cancel-button {
    background-color: #272935;
    color: var(--colors-btn-primary-text, #fff);
  }

  .continue-button {
    background-color: #3670f7;
    color: var(--Neutral-White, #fff);
  }

  @media (max-width: 991px) {
    .modal {
      padding: 0 20px;
    }

    .modal-header,
    .modal-message,
    .modal-actions {
      max-width: 100%;
    }
  }
</style>
