<script lang="ts">
  export const heading: string = "",
    description: string = "",
    subHeading: string = "",
    subSubHeadingOne: string = "",
    subSubDescOne: string = "",
    subSubHeadingTwo: string = "",
    subSubDescTwo: string = "";
</script>

<section class="under-dev-sec">
  <h1>{heading}</h1>
  <h3>COMING SOON</h3>

  <p>
    {description}
  </p>

  <div>
    <h4>{subHeading}</h4>

    <div>
      <div>
        <h3>
          {subSubHeadingOne}
        </h3>
        <p>
          {subSubDescOne}
        </p>
      </div>
      <div>
        <h3>
          {subSubHeadingOne}
        </h3>
        <p>
          {subSubDescTwo}
        </p>
      </div>
      <a href="/"> View Roadmap </a>
    </div>
  </div>
</section>

<style lang="scss">
  .under-dev-sec {
    margin-top: 44px;
    text-align: center;
  }
</style>
