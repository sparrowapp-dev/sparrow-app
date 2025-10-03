<script>
    import Clock from "../../../../../../../@sparrow-library/src/icons/clock.svelte";
  </script>
  
  <div class="empty-state">
    <Clock class="empty-icon" width="32px" height="32px" color="var(--text-secondary-200)" />
  
    <p class="empty-text">
      No results yet. Your scheduled runs will appear here once they’re executed.
    </p>
  
    <p class="empty-subtext">
      You can click <span class="highlight">Run Now</span> to generate results instantly.
    </p>
  </div>
  
  <style lang="scss">
    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;   // ✅ vertical centering
      align-items: center;       // ✅ horizontal centering
      text-align: center;
      height: 100%;              // ✅ ensures it fills the container
      min-height: 400px;         // fallback if container doesn’t stretch
      gap: 12px;                 // space between icon and text
      color: var(--text-secondary-200);
    }
  
    .empty-icon {
      width: 26px;
      height: 26px;
      color: var(--text-secondary-100);
    }
  
    .empty-text {
      font-size: 12px;
      font-weight: 400;
      margin: 0;
    }
  
    .empty-subtext {
      font-size: 12px;
      color: var(--text-secondary-200);
      margin: 0;

      .highlight {
        font-weight: 600;
        color: var(--text-secondary-100);
      }
    }
  </style>
  