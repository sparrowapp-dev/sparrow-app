<script>
  import { Ellipse, LogoSymbol } from "@sparrow/library/icons";
  import DiscordPost from "../../discord-post/layout/DiscordPost.svelte";

  let isReadMore = false;
</script>

<div style=" padding:20px;">
  <div style="" class="">
    <div>
      <p class="text-ds-font-size-20 fw-semibold mb-2">Community</p>
      <p
        class="text-ds-font-size-14"
        style="color: var(--text-ds-neutral-400);"
      >
        Stay updated with all feedback, from planning to progress, on a single
        roadmap.
      </p>
    </div>
    <div class="feedback-section active">
      <h3 class="text-ds-font-size-14 text-ds-font-weight-semi-bold" style="">
        Share your feedback on our product!!
      </h3>
      <p
        class="text-ds-font-size-12 text-ds-font-weight-regular"
        style="margin-bottom: 0;"
      >
        Please let us know how we can make Sparrow the best product for you.
      </p>
    </div>

    <div class="content-section">
      <h2
        class="text-ds-font-size-12"
        style="display:flex; align-items:center; padding: 16px, 10px, 10px, 10px;"
      >
        <LogoSymbol height="25px" width="25px" />
        <div
          class="text-ds-font-size-16 text-ds-font-weight-semi-bold"
          style=" padding: 3px; padding-top:9px; padding-left:8px; display:inline; color: var(--text-secondary-100);"
        >
          Welcome to Sparrow’s Community Hub!
        </div>
      </h2>
      <p
        class="text-ds-font-size-14 text-ds-font-weight-regular"
        style="color:var(--text-ds-neutral-400); width: 80%;"
      >
        We're excited to hear your thoughts and suggestions on how we can
        improve Sparrow, your go-to API management application. Whether it's a
        new feature idea, a bug report, or general feedback, every comment is
        valuable to us.
      </p>
    </div>

    <div class="discord-section">
      <h3
        class="text-ds-font-size-16 text-ds-font-weight-semi-bold"
        style="color: var(--text-secondary-100); margin-bottom: 4px;"
      >
        Connect with Us
      </h3>
      <p
        class="text-ds-font-size-14 text-ds-font-weight-regular"
        style="color:var(--text-ds-neutral-400); width: 85%;"
      >
        Utilize our integrated Discord community to send messages directly to
        our team and other users, even if you don't have a Discord account. Your
        messages will appear instantly in our Discord channel, ensuring you get
        quick responses and can engage in real-time discussions.
      </p>

      <div class="key-features">
        <h3
          class="text-ds-font-size-16 text-ds-font-weight-semi-bold"
          style="color: var(--text-secondary-100); margin-bottom: 4px;"
        >
          Key Features
        </h3>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; margin-left: 8px; color:var(--text-ds-neutral-400);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Markdown Support:</span
          ><span class="text-ds-font-size-14 text-ds-font-weight-regular"
            >Use markdown to format your messages and feedback.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; margin-left: 8px; color:var(--text-ds-neutral-400);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Switchable Channel:</span
          ><span class="text-ds-font-size-14 text-ds-font-weight-regular"
            >Easily navigate between different feedback and support channels.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; margin-left: 8px;  color:var(--text-ds-neutral-400);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Rich media sharing:</span
          ><span class="text-ds-font-size-14 text-ds-font-weight-regular">
            Share screenshots , videos and other files to provide comprehensive
            feedback.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; margin-left: 8px;  color:var(--text-ds-neutral-400);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold"
            >Tagging:
          </span><span class="text-ds-font-size-14 text-ds-font-weight-regular"
            >Tag your feedback for easy categorization and searchability.</span
          >
        </p>
        <p
          class="text-ds-font-size-14 text-ds-font-weight-regular"
          style="margin: 0px; padding-left:26px; color:var(--text-ds-neutral-400);"
        >
          Join our community and start contributing to Sparrow's development.
          Click the button below to get started:
        </p>
      </div>

      <!-- <div class="d-flex justify-content-center">
        <p
          role="button"
          class="d-flex align-items-center"
          on:click={() => {
            isReadMore = !isReadMore;
          }}
        ></p>
      </div> -->
      <div class="pt-3">
        <DiscordPost />
      </div>
    </div>
  </div>
</div>

<style>
  .feedback-section {
    background: rgba(49, 108, 246, 0.2);
    padding: 15px;
    border-radius: 4px;
    display: none;
  }

  .feedback-section.active {
    display: block;
  }

  .content-section {
    margin-top: 20px;
  }

  .content-section p {
    margin: 10px 0;
  }

  .discord-section {
    margin-top: 20px;
  }

  .discord-section h3 {
    margin-bottom: 10px;
  }

  .discord-section p {
    font-size: 14px;
  }
</style>
