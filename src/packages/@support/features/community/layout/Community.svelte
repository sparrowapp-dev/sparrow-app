<script>
  import Ellipse from "@library/icons/Ellipse.svelte";
  import LogoSymbol from "@library/icons/LogoSymbol.svelte";
  import { Tooltip } from "@library/ui/tooltip";
  import { ArrowUnfilledIcon } from "@library/icons";

  let isReadMore = false;
</script>

<div class="ps-2 pt-2" style=" background-color: black;">
  <div style="" class="">
    <div>
      <p style="font-size: 20px; font-weight:700;">Community</p>
      <p style="color: #999999; font-size;14px;">
        Stay updated with all feedback, from planning to progress, on a single
        roadmap.
      </p>
    </div>
    <div class="feedback-section active">
      <h3
        class=""
        style="font-size: 14px; font-weight : 700 line-height: 21px; "
      >
        Share your feedback on our product!!
      </h3>
      <p class="fw-light" style="font-size: 14px;">
        Please let us know how we can make Sparrow the best product for you.
      </p>
    </div>

    <div class="content-section px-2">
      <h2 class="" style="padding: 16px, 10px, 10px, 10px;">
        <LogoSymbol height="25px" width="25px" />
        <div
          style="font-weight:700; padding: 3px; padding-top:9px; padding-left:5px; display:inline; font-size: 16px;"
        >
          Welcome to Sparrow’s Community Hub!
        </div>
      </h2>
      <p
        class=""
        style="font-weight:400; font-size:14px; color:var(--text-secondary-50);"
      >
        We're excited to hear your thoughts and suggestions on how we can
        improve Sparrow, your go-to API management application. <br /> Whether it's
        a new feature idea, a bug report, or general feedback, every comment is valuable
        to us.
      </p>
    </div>

    <div class="discord-section px-2">
      <h3 style="color: var(--text-secondary-100); font-weight:700;">
        Connect with Us
      </h3>
      <p
        class=""
        style="font-weight:400; font-size:14px; color: var(--text-secondary-50); "
      >
        Utilize our integrated Discord community to send messages directly to
        our team and other users, even if you don't have a Discord account. Your
        messages will appear instantly in our Discord channel, ensuring you get
        quick responses and can engage in real-time discussions.
      </p>

      <div class="key-features">
        <h3 style="font-weight:700;">Key Features</h3>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; color:var(--text-secondary-50);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Markdown Support:</span
          ><span style="font-weight:400; font-size:14px;"
            >Use markdown to format your messages and feedback.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; color:var(--text-secondary-50);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Switchable Channel:</span
          ><span style="font-weight:400; font-size:14px;"
            >Easily navigate between different feedback and support channels.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px;  color:var(--text-secondary-50);"
        >
          <span><Ellipse color={"var(--icon-primary-300)"} /> </span><span
            class="fw-bold">Rich media sharing:</span
          ><span style="font-weight:400; font-size:14px;">
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
          </span><span style="font-weight:400; font-size:14px;"
            >Tag your feedback for easy categorization and searchability.</span
          >
        </p>
        <p
          style="font-weight:400; font-size:14px; margin: 0px; padding-left:17px;  color:var(--text-secondary-50);"
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
  .feedback-section,
  .faq-section {
    background: rgba(54, 112, 247, 0.2);

    border: 1px solid;
    padding: 15px;
    border-radius: 4px;
    border-color: var(--bg-primary-600);
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
