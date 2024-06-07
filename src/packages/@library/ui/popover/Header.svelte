<script>
   export let nextStep;
  export let previousStep;
</script>

<header>
    <button class="border-0" style="background-color: #3670F7 ; padding:3px 19px 3px 20px; border-radius:4.78px; outline:none;" on:click={previousStep}>Previous</button>
    <button class="border-0" style="background-color: #3670F7 ; padding:3px 19px 3px 20px; border-radius:4.78px; outline:none;" on:click={nextStep}>Next</button>
</header>