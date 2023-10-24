<script>
  import Header from "$lib/components/header/Header.svelte";
  import { navigate } from "svelte-navigator";

  // Function to maximize the page
  // const maximizePage = () => {
  //   document.body.style.height = "100vh";
  //   document.body.style.width = "1500px";
  // };
</script>

<div class="homePage">
  <div class="header">
    <Header />
  </div>
  <h1>Welcome to Sparrow App</h1>
  <a href="/dashboard/collections" class="btn btn-link mt-4 w-100">Continue</a>
  <!-- <a href="/" class="btn btn-link mt-4 w-100">Go Back</a> -->
</div>

<style>
  .homePage {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #000000;
    margin: auto;
    max-width: 1500px;
    overflow: hidden;
    border-radius: 14px;
  }

  @media (min-width: 600px) {
    .homePage {
      border-radius: 14px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: black;
      margin: auto;
      padding-top: 1px;
      padding-bottom: 10px;
      max-width: 1500px;
      overflow: hidden;
    }

    h1 {
      text-align: center;
      margin-top: 300px;
    }
  }
</style>
