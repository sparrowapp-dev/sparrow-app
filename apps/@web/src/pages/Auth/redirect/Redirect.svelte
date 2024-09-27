<script lang="ts">
	import sparrowicon from '$lib/assets/logoSparrowSquare.svg';
	import Spinner from '$lib/components/transition/Spinner.svelte';
	import { fly, fade } from 'svelte/transition';
	


	export let title="Title";
	export let description= "Description";
	export let message="Detailed Message";
	export let isSpinner= true;
	export let buttonText="Button";
	export let buttonClick = () =>{} ;
	export let loadingMessage = "";
</script>

<!-- <Header /> -->
<div class="background-overlay d-flex align-items-center justify-content-center" transition:fade={{ delay: 0, duration: 100 }}>
	<div
		class="container rounded container d-flex flex-column align-items-center justify-content-center w-100"
		transition:fly={{ y: 50, delay: 0, duration: 100 }}
		on:introstart
		on:outroend
	>
		<div class="text-white d-flex justify-content-center align-items-center bg-sparrowPrimaryColor" style="height: 60px; width: 60px; border-radius: 6px;">
			<img src={sparrowicon} alt="" class="" />
		</div>
		<p
			class="container-header mb-2 pt-4 pb-0 sparrow-fs-28 sparrow-fw-600 text-transparent text-center ms-2 me-2 ellipsis "
			style=" max-width:500px; font-size: 28px; background: linear-gradient(270deg, #584FFD -9.44%, #A1D8FF 46.24%, #1193F0 96.79%); background-clip: text;"
		>
			{title}
		</p>

		{#if isSpinner}
			<div class="sparrow-fw-300 sparrow-fs-14">
				<div style="text-align:center" class="text-lightGray">
					<p>{description}</p>
				</div>

				<div style="text-align:center; max-width: 370px;" class="text-lightGray mt-4 sparrow-fw-300 sparrow-fs-14">
					<p>
						{message}
					</p>
				</div>
			</div>
		{:else}
			<div class="sparrow-fw-400 sparrow-fs-16">
				<div style="text-align:center" class="text-lightGray">
					<p>{description}</p>
				</div>

				<div style="text-align:center; max-width: 370px;" class="text-lightGray mt-4 sparrow-fw-300 sparrow-fs-14">
					<p>
						{message}
					</p>
				</div>
			</div>
		{/if}

		{#if isSpinner}
			<div
				style="font-size: 14px;text-align:center"
				class="text-lightGray d-flex align-items-center justify-content-center mt-4"
			>
				<Spinner size={'45px'} />
			</div>
		{:else}
			<div
				style="font-size: 14px;text-align:center"
				class="text-lightGray d-flex align-items-center justify-content-center mt-3"
			>
				<button
					class="buttons sparrow-fs-16 px-3 py-2 d-flex justify-content-center align-items-center gap-1"
					on:click={buttonClick}
				>
					{buttonText}
				</button>
			</div>
		{/if}

		{#if loadingMessage}
			<div class="welcome-spinner text-lightGray mt-4 sparrow-fw-300 sparrow-fs-14">
				<p>{loadingMessage}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.background-overlay {
		min-height: 100vh;
		overflow: auto;
	}

	.container {
		margin: 30px !important;
        max-width: 700px;
        padding: 48px 48px 64px 48px !important;
	}
	.container-header{
		  background: linear-gradient(45deg, #B4A9FD, #EEF8FF);
  		-webkit-background-clip: text;
  		-webkit-text-fill-color: transparent;

	}

	.buttons {
		border-radius: 4px;
		background: var(--primary-color);
		border: none;
	}
	.buttons:hover{
		background: var(--primary-btn-color-hover)
	}
    .buttons:active{
	background:var(--button-pressed)
    }




	.welcome-spinner {
		font-size: 14px;
		text-align: center;
	}
</style>
