<script lang="ts">
	import starIcon from '$lib/assets/starIcon.svg';
	import AngleUp from '$lib/assets/angle-up.svelte';
	import BgContainer from '$lib/components/bgContainer/BgContainer.svelte';
	import { handleForgotPassword, handleForgotPasswordValidation } from './forgot-password';
	import sparrowicon from '$lib/assets/logoSparrowSquare.svg';

	import {  navigate } from 'svelte-navigator';
	import { notifications } from '$lib/components/toast-notification/ToastNotification';
	import Button from '$lib/components/button/Button.svelte';

	let validationErrors: any = {};

	let forgotPasswordCredential = {
		email: ''
	};
	let responseError = "";
	let isEmailTouched = false;
	let forgotPasswordLoader = false;
</script>

<BgContainer>
	<p
		class="container-header pb-3 sparrow-fs-36 text-whiteColor ms-2 me-2 sparrow-fw-500 w-100 text-left"
		style="letter-spacing: 0.05em;"
	>
		Welcome to Sparrow!
	</p>
	<form
		class="login-form text-whiteColor ps-1 pe-1 gap-16 w-100"
		on:submit|preventDefault={async () => {
			isEmailTouched = true;
			validationErrors = await handleForgotPasswordValidation(forgotPasswordCredential);
			if(!validationErrors?.email){
				forgotPasswordLoader = true;
				const response  = await handleForgotPassword(forgotPasswordCredential);
				if (response?.isSuccessful) {
					localStorage.setItem(`timer-${forgotPasswordCredential.email}`, new Date().getTime());
					navigate(`/update/password/${forgotPasswordCredential.email}`);
					notifications.success("Verification code has been sent to your registered Email ID")
				} else {
					if(response.message === "Bad Request"){
						responseError= "Email ID is not registered."
					}
					else{
						notifications.error(response?.message);
					}
				}
				forgotPasswordLoader = false;
			}
		}}
	>
		<div class="d-flex flex-column align-items-left justify-content-center mb-2">
			<div class="d-flex align-items-center justify-content-start mb-3 gap-2">
				<a 
					class="border-0 bg-transparent font-monospace" style="transform: rotate(-90deg);" 
					href={`/init`}
				>
					<AngleUp color="var(--sparrow-text-color)" height={20} width={20} />
				</a>
				<p class="text-whiteColor sparrow-fs-14 sparrow-fw-500 mb-0">Change Password</p>
			</div>
			<p class="text-lightGray sparrow-fs-14">
				Please enter your Email ID to receive a verification code.
			</p>
		</div>
		<div class="mb-3">
			<div>
				<label for="exampleInputEmail1" class="form-label text-lightGray sparrow-fs-14 d-flex">Email<p class="ms-1 mb-0 sparrow-fw-600 text-dangerColor">*</p></label>
			</div>
			<input
				type="email"
				class="form-control sparrow-fs-16 border:{validationErrors?.email && isEmailTouched
					? '3px'
					: '1px'} solid {validationErrors?.email && isEmailTouched ? 'border-error' : 'border-default'}"
				id="exampleInputEmail1"
				aria-describedby="emailHelp"
				placeholder="Please enter your registered Email ID"
				autocorrect="off"
				autocapitalize="none"
				autocomplete="off"
				bind:value={forgotPasswordCredential.email}
				on:blur={async()=>{
					isEmailTouched = true;
					validationErrors = await handleForgotPasswordValidation(forgotPasswordCredential);
				}}
				on:input={async()=>{
					validationErrors = await handleForgotPasswordValidation(forgotPasswordCredential);
					responseError = "";
				}}
			/>
			{#if validationErrors?.email && isEmailTouched}
				<small class="form-text text-dangerColor"> {validationErrors?.email}</small>
				{:else if responseError}
				<small class="form-text text-dangerColor"> {responseError}</small>
				
			{/if}
		</div>
		<div class="sendButton">
			<Button
						disable={forgotPasswordLoader}
						title={"Send Request"}
						buttonClassProp={"w-100 py-2 align-items-center d-flex justify-content-center sparrow-fs-16"}
						type={"primary-gradient"}
						loader={forgotPasswordLoader}
				  	/>
		</div>
	</form>
</BgContainer>
<style>
	input {
		background-color: transparent;
	}
</style>
