<script>
  let activeTab = "feedback";

  function setActiveTab(tab) {
    if (tab !== "faq") {
      // Disable FAQ tab
      activeTab = tab;
    }
  }
</script>

<div class="container">
  <div class="tabs">
    <div
      class="tab {activeTab === 'feedback' ? 'active' : ''}"
      on:click={() => setActiveTab("feedback")}
    >
      Feedback
    </div>
    <div
      class="tab disabled {activeTab === 'faq' ? 'active' : ''}"
      on:click={() => setActiveTab("faq")}
    >
      FAQs
    </div>
  </div>

  <div class="feedback-section {activeTab === 'feedback' ? 'active' : ''}">
    <h3>Share your feedback on our product!!</h3>
    <p>Please let us know how we can make Sparrow the best product for you.</p>
  </div>

  <div class="faq-section {activeTab === 'faq' ? 'active' : ''}">
    <h3>FAQs</h3>
    <p>Here you can find the answers to the most frequently asked questions.</p>
  </div>

  {#if activeTab === "feedback"}
    <div class="content-section">
      <h2>Welcome to Sparrow’s Community Hub!</h2>
      <p>
        We're excited to hear your thoughts and suggestions on how we can
        improve Sparrow, your go-to API management application. Whether it's a
        new feature idea, a bug report, or general feedback, every comment is
        valuable to us.
      </p>
    </div>

    <div class="discord-section">
      <h3>Connect with Us</h3>
      <p>
        Utilize our integrated Discord community to send messages directly to
        our team and other users, even if you don't have a Discord account. Your
        messages will appear instantly in our Discord channel, ensuring you get
        quick responses and can engage in real-time discussions.
      </p>
    </div>
  {/if}
</div>

<style>
  .container {
    background-color: #181818;
    color: white;
    padding: 20px;
    border-radius: 10px;
    width: "90%";
    margin: 0 auto;
  }

  .tabs {
    display: flex;
    border-bottom: 2px solid #1e1e1e;
  }

  .tab {
    padding: 10px 20px;
    cursor: pointer;
    color: #b0b0b0;
    position: relative;
  }

  .tab.active {
    color: white;
  }

  .tab.active::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    background-color: var(--border-primary-300);
  }

  .tab.disabled {
    color: #555555;
    cursor: not-allowed;
  }

  .feedback-section,
  .faq-section {
    background-color: #1e1e1e;
    padding: 15px;
    margin-top: 10px;
    border-radius: 5px;
    display: none;
  }

  .feedback-section.active,
  .faq-section.active {
    display: block;
  }

  .feedback-section h3,
  .faq-section h3 {
    margin: 0;
    font-size: 12px;
  }

  .feedback-section p,
  .faq-section p {
    margin: 5px 0 0;
    font-size: 0.9em;
  }

  .content-section {
    margin-top: 20px;
  }

  .content-section h2 {
    font-size: 16px;
  }

  .content-section p {
    margin: 10px 0;
    font-size: 14px;
  }

  .discord-section {
    margin-top: 20px;
  }

  .discord-section h3 {
    font-size: 16px;
    margin-bottom: 10px;
  }

  .discord-section p {
    font-size: 14px;
  }
</style>
