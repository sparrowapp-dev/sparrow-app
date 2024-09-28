<script>
  import { Ellipse } from "@sparrow/library/icons";
  import { LogoSymbol } from "@sparrow/library/icons";
  import { ArrowUnfilledIcon } from "@sparrow/library/icons";

  let isReadMore = false;
</script>

<div class="p-3 mt-1" style="background-color: black;">
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

    <div class="content-section px-3">
      <h2 class="" style="padding: 16px, 10px, 10px, 10px;">
        <LogoSymbol height="25px" width="25px" />
        <div
          style="padding: 3px; padding-top:9px; padding-left:5px; display:inline; font-size: 16px;"
        >
          Welcome to Sparrow’s Community Hub!
        </div>
      </h2>
      <p class="fw-light" style="color:var(--text-secondary-50);">
        We're excited to hear your thoughts and suggestions on how we can
        improve Sparrow, your go-to API management application. Whether it's a
        new feature idea, a bug report, or general feedback, every comment is
        valuable to us.
      </p>
    </div>

    <div class="discord-section px-3">
      <h3 style="color: var(--text-secondary-100);">Connect with Us</h3>
      <p class="fw-light" style="color: var(--text-secondary-50);">
        Utilize our integrated Discord community to send messages directly to
        our team and other users, even if you don't have a Discord account. Your
        messages will appear instantly in our Discord channel, ensuring you get
        quick responses and can engage in real-time discussions.
      </p>

      <!-- {#if isReadMore} -->
      <div class="key-features">
        <h3>Key Features</h3>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px; color:var(--text-secondary-50);"
        >
          <span><Ellipse /> </span><span class="fw-bold"
            >Switchable Channel:</span
          ><span class="fw-light"
            >Easily navigate between different feedback and support channels.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px;  color:var(--text-secondary-50);"
        >
          <span><Ellipse /> </span><span class="fw-bold"
            >Rich media sharing:</span
          ><span class="fw-light">
            Share screenshots , videos and other files to provide comprehensive
            feedback.</span
          >
        </p>
        <p
          class="d-flex gap-2 align-items-center"
          style="margin: 0px;  color:var(--text-secondary-50);"
        >
          <span><Ellipse /> </span><span class="fw-bold">Tagging: </span><span
            class="fw-light"
            >Tag your feedback for easy categorization and searchability.</span
          >
        </p>
        <p
          class="fw-light"
          style="margin: 0px; padding-left:17px;  color:var(--text-secondary-50);"
        >
          Join our community and start contributing to Sparrow.
        </p>
      </div>
      <!-- {/if} -->

      <div class="d-flex justify-content-center">
        <p
          role="button"
          class="d-flex align-items-center"
          on:click={() => {
            isReadMore = !isReadMore;
          }}
        >
          <!-- <span class="me-2 text-primary-300 text-fs-14"
            >{!isReadMore ? "More" : "Less"}</span
          >
          <span
            class="position-relative d-inline-block"
            style={!isReadMore ? "" : "transform: rotate(180deg) !important;"}
          >
            <ArrowUnfilledIcon
              height={"14px"}
              width={"14px"}
              color={"var(--text-primary-300)"}
            />
          </span> -->
        </p>
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
