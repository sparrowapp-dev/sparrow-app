<script lang="ts">
  export let heading: string = "",
    description: string = "",
    subHeading: string = "",
    subSubHeadingOne: string = "",
    subSubDescOne: string = "",
    subSubHeadingTwo: string = "",
    subSubDescTwo: string = "";
</script>

<section class="under-dev-sec p-5">
  <h1 class="text-lightGray under-dev-sec-heading">{heading}</h1>
  <h3 class="text-defaultColor coming-soon-text">COMING SOON</h3>

  <p class="under-dev-desc under-dev-sec-desc">
    {description}
  </p>

  <div>
    <h4 class="under-dev-desc under-dev-sec-sub-heading">{subHeading}</h4>

    <div class="eclipse-container">
      <div class="eclipse"></div>
      <hr />
      <div class="eclipse"></div>
    </div>
    <div class="under-dev-content">
      <div class="under-dev-sub-content">
        <h3 class="under-dev-desc under-dev-sec-sub-sub-heading">
          {subSubHeadingOne}
        </h3>
        <p class="text-defaultColor under-dev-sec-sub-sub-desc">
          {subSubDescOne}
        </p>
      </div>
      <div class="under-dev-sub-content">
        <h3 class="under-dev-desc under-dev-sec-sub-sub-heading">
          {subSubHeadingTwo}
        </h3>
        <p class="text-defaultColor under-dev-sec-sub-sub-desc">
          {subSubDescTwo}
        </p>
      </div>
    </div>
    <a
      target="_blank"
      href="http://sparrowapp.dev/"
      class="view-roadmap-btn text-white text-decoration-none"
    >
      View Roadmap
    </a>
  </div>
</section>

<style lang="scss">
  .under-dev-sec {
    text-align: center;
    margin: auto;
    letter-spacing: 0.4px;
  }
  .view-roadmap-btn {
    border-radius: var(--padding-padding-md, 8px);
    background: var(
      --gradiant-1,
      linear-gradient(90deg, #6147ff 0%, #1193f0 100%)
    );
    display: flex;
    padding: 10px;
    justify-content: center;
    align-items: center;
    width: fit-content;
    margin: auto;
    gap: 10px;
  }
  .under-dev-sec-desc {
    font-family: Roboto; /*Inter*/
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    width: 70%;
    margin: 5% auto;
    line-height: 150%;
  }
  .under-dev-desc {
    color: var(--request-arc);
  }
  .under-dev-sec-heading {
    font-family: Roboto;
    font-size: 32px;
    font-style: normal;
    font-weight: 500;
    line-height: 120%;
  }
  .coming-soon-text {
    font-family: Roboto;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 150%;
  }

  .under-dev-sec-sub-heading {
    font-family: Roboto; /*Inter*/
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 150%;
  }

  .under-dev-sec-sub-sub-heading {
    font-family: Roboto; /*Inter*/
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: 150%;
  }
  .under-dev-sec-sub-sub-desc {
    font-family: Roboto;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
  }
  .under-dev-content {
    width: 60%;
    margin: 3% auto;
    display: flex;
    place-content: space-between;
  }
  .under-dev-sub-content {
    width: 40%;
  }

  .eclipse-container {
    display: flex;
    width: 40%;
    margin: 5% auto 0% auto;
    // margin: auto 5%;
    place-content: space-between;
  }
  .eclipse-container > hr {
    width: 100%;
    border: none;
    height: 2px;
    background: #000;
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
    margin: auto;
    background-color: #999;
    border-radius: 50%;
  }
</style>
