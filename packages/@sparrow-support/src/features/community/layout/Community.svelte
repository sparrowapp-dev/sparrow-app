<script>
  import { Ellipse, LogoSymbol } from "@sparrow/library/icons";

  let isReadMore = false;
</script>

<div style=" padding:20px; background-color: black;">
  <div style="" class="">
    <div>
      <p class="text-fs-20" style="font-weight:700;">Community</p>
      <p class="text-fs-14" style="color: var(--text-secondary-50);">
        Stay updated with all feedback, from planning to progress, on a single
        roadmap.
      </p>
    </div>
    <div class="feedback-section active">
      <h3 class="" style="font-size:14px; font-weight:700 line-height: 21px; ">
        Share your feedback on our product!!
      </h3>
      <p class="text-fs-12" style="font-weight: 400; ">
        Please let us know how we can make Sparrow the best product for you.
      </p>
    </div>

    <div class="content-section px-2">
      <h2 class="text-fs-12" style="padding: 16px, 10px, 10px, 10px;">
        <LogoSymbol height="25px" width="25px" />
        <div
          class="text-fs-16"
          style="font-weight:700; padding: 3px; padding-top:9px; padding-left:5px; display:inline;"
        >
          Welcome to Sparrow’s Community Hub!
        </div>
      </h2>
      <p
        class="text-fs-14"
        style="font-weight:400; color:var(--text-secondary-50);"
      >
        We're excited to hear your thoughts and suggestions on how we can
        improve Sparrow, your go-to API management application. <br /> Whether it's
        a new feature idea, a bug report, or general feedback, every comment is valuable
        to us.
      </p>
    </div>

    <div class="discord-section px-2">
      <h3
        class="text-fs-16"
        style="color: var(--text-secondary-100); font-weight:700;"
      >
        Connect with Us
      </h3>
      <p
        class="text-fs-14"
        style="font-weight:400;  color: var(--text-secondary-50); "
      >
        Utilize our integrated Discord community to send messages directly to
        our team and other users, even if you don't have a Discord account. Your
        messages will appear instantly in our Discord channel, ensuring you get
        quick responses and can engage in real-time discussions.
      </p>

      <div class="key-features">
        <h3 class="text-fs-16" style="font-weight:700;">Key Features</h3>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; color:var(--text-secondary-50);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Markdown Support:</span
          ><span class="text-fs-14" style="font-weight:400; "
            >Use markdown to format your messages and feedback.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; color:var(--text-secondary-50);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Switchable Channel:</span
          ><span class="text-fs-14" style="font-weight:400;"
            >Easily navigate between different feedback and support channels.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px;  color:var(--text-secondary-50);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Rich media sharing:</span
          ><span class="text-fs-14" style="font-weight:400; ">
            Share screenshots , videos and other files to provide comprehensive
            feedback.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px;  color:var(--text-secondary-50);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold"
            >Tagging:
          </span><span class="text-fs-14" style="font-weight:400; "
            >Tag your feedback for easy categorization and searchability.</span
          >
        </p>
        <p
          class="text-fs-14"
          style="font-weight:400;margin: 0px; padding-left:17px;  color:var(--text-secondary-50);"
        >
          Join our community and start contributing to Sparrow.
        </p>
      </div>

      <div class="d-flex justify-content-center">
        <p
          role="button"
          class="d-flex align-items-center"
          on:click={() => {
            isReadMore = !isReadMore;
          }}
        ></p>
      </div>
    </div>
  </div>
</div>

<style>
  .feedback-section {
    background: rgba(54, 112, 247, 0.2);
    border: 1px solid;
    padding: 15px;
    border-radius: 4px;
    border-color: var(--bg-primary-600);
    display: none;
  }

  .feedback-section.active {
    display: block;
  }

  .feedback-section h3 {
    margin: 0;
    font-size: 12px;
  }

  .feedback-section p {
    margin: 5px 0 0;
    font-size: 0.9em;
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
