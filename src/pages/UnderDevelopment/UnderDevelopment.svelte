<script lang="ts">
  export let heading: string = "",
    description: string = "",
    subHeading: string = "",
    subSubHeadingOne: string = "",
    subSubDescOne: string = "",
    subSubHeadingTwo: string = "",
    subSubDescTwo: string = "";
</script>

<section class="under-dev-sec text-center p-5 m-auto">
  <h1 class="text-lightGray under-dev-sec-heading fs-1 fw-medium lh-base">
    {heading}
  </h1>
  <h3 class="text-defaultColor coming-soon-text fs-6 fw-bold lh-base">
    COMING SOON
  </h3>

  <p class="under-dev-desc under-dev-sec-desc fs-6 fw-medium lh-base">
    {description}
  </p>

  <div>
    <h4 class="under-dev-desc under-dev-sec-sub-heading fs-6 fw-bold lh-base">
      {subHeading}
    </h4>

    <div class="eclipse-container d-flex">
      <div class="eclipse m-auto rounded-5"></div>
      <hr class="border-0 w-100" />
      <div class="eclipse m-auto rounded-5"></div>
    </div>
    <div class="under-dev-content d-flex">
      <div class="under-dev-sub-content">
        <h3
          class="under-dev-desc under-dev-sec-sub-sub-heading fs-6 fw-semibold lh-base"
        >
          {subSubHeadingOne}
        </h3>
        <p
          class="text-defaultColor under-dev-sec-sub-sub-desc fw-normal lh-base"
        >
          {subSubDescOne}
        </p>
      </div>
      <div class="under-dev-sub-content">
        <h3
          class="under-dev-desc under-dev-sec-sub-sub-heading fs-6 fw-semibold lh-base"
        >
          {subSubHeadingTwo}
        </h3>
        <p
          class="text-defaultColor under-dev-sec-sub-sub-desc fw-normal lh-base"
        >
          {subSubDescTwo}
        </p>
      </div>
    </div>
    <a
      target="_blank"
      href="http://sparrowapp.dev/"
      class="view-roadmap-btn rounded d-flex p-2 justify-content-center align-items-center text-white text-decoration-none m-auto gap-2"
    >
      View Roadmap
    </a>
  </div>
</section>

<style lang="scss">
  .under-dev-sec {
    letter-spacing: 0.4px;
    font-style: normal;
    font-family: Roboto;
  }
  .view-roadmap-btn {
    background: var(
      --gradiant-1,
      linear-gradient(90deg, #6147ff 0%, #1193f0 100%)
    );
    width: fit-content;
  }
  .under-dev-sec-desc {
    width: 70%;
    margin: 5% auto;
  }
  .under-dev-desc {
    color: var(--request-arc);
  }

  .under-dev-sec-sub-sub-desc {
    font-size: 12px;
  }
  .under-dev-content {
    width: 60%;
    margin: 3% auto;
    place-content: space-between;
  }
  .under-dev-sub-content {
    width: 40%;
  }

  .eclipse-container {
    width: 40%;
    margin: 5% auto 0% auto;
    place-content: space-between;
  }
  .eclipse-container > hr {
    height: 2px;
    background: repeating-linear-gradient(
      90deg,
      #999,
      #999 6px,
      transparent 6px,
      transparent 12px
    );
  }

  .eclipse {
    width: 25px;
    height: 25px;
    background-color: #999;
  }
</style>
