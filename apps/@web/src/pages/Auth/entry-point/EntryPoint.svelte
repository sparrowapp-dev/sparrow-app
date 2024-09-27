<script lang="ts">
	import { handleEntryValidation, handleEntry } from './EntryPoint.ViewModel';
	import sparrowicon from '$lib/assets/logoSparrowSquare.svg';
	import { navigate } from 'svelte-navigator';
	import Redirect from '../redirect/Redirect.svelte';
	import constants from '$lib/utils/constants';
	import SupportHelp from '$lib/components/help/SupportHelp.svelte';
	import { notifications } from '$lib/components/toast-notification/ToastNotification';
	import Oauth from '$lib/components/o-auth/Oauth.svelte';
	import starIcon from '$lib/assets/starIcon.svg';
	import Button from '$lib/components/button/Button.svelte';
	import BgContainer from '$lib/components/bgContainer/BgContainer.svelte';

	let isEmailTouched = false;
	//---------------- Login Validation --------------------//
	let validationErrors: any = {};
	//------------ login Credentials ---------------//
	let entryCredentials: {
		email: string;
	} = {
		email: ''
	};
	let isEntry = false;

	let redirectRules = {
		title: 'Redirecting to your account...',
		description: '',
		message: ``,
		isSpinner: true,
		buttonText: 'Open Desktop App',
		buttonClick: () => {},
		loadingMessage: 'Please wait while we are redirecting you to your email account....'
	};
	let entryLoader = false;
</script>

{#if isEntry}
	<Redirect
		title={redirectRules.title}
		description={redirectRules.description}
		message={redirectRules.message}
		isSpinner={redirectRules.isSpinner}
		buttonText={redirectRules.buttonText}
		buttonClick={redirectRules.buttonClick}
		loadingMessage={redirectRules.loadingMessage}
	/>
{:else}
	<BgContainer>
		<div
			class="text-white d-flex justify-content-center align-items-center bg-sparrowPrimaryColor"
			style="height: 60px; width: 60px; border-radius: 6px;"
		>
			<img src={sparrowicon} alt="" class="" />
		</div>
		<p
			class="container-header pt-4 pb-4 sparrow-fs-28 sparrow-fw-600 text-whiteColor text-center ms-2 me-2"
			style="letter-spacing: 0.05rem;"
		>
			Welcome to Sparrow!
		</p>
		<form
			class="login-form w-100 text-whiteColor ps-1 pe-1 mb-2"
			novalidate
			on:submit|preventDefault={async () => {
				isEmailTouched = true;
				validationErrors = await handleEntryValidation(entryCredentials);
				if (!validationErrors?.email) {
					entryLoader = true;
					const response = await handleEntry(entryCredentials);
					if (response.isSuccessful) {
						if (
							response?.data?.registeredWith === 'email' ||
							response?.data?.registeredWith === 'google'
						) {
							// registered with email
							isEntry = true;
							redirectRules.title = `Redirecting to your account...`;
							redirectRules.description = `${entryCredentials?.email} has been previously used to login via email account.`;
							redirectRules.loadingMessage = `Please wait while we are redirecting you to your email account....`;
							setTimeout(() => {
								navigate(`/login/${entryCredentials?.email}`);
							}, 1000);
						} else {
							navigate(`/register/${entryCredentials?.email}`);
						}
					} else {
						notifications.error(response?.message);
					}
					entryLoader = false;
				}
			}}
		>
			<p class="card-subtitle sparrow-fs-20 sparrow-fw-500 mb-3">Sign In or Create an Account</p>
			<div class="mb-3">
				<label for="exampleInputEmail1" class="form-label text-lightGray sparrow-fs-14 d-flex"
					>Email
					<p class="ms-1 mb-0 sparrow-fw-600 text-dangerColor">*</p></label
				>
				<!-- <img src={starIcon} alt="" class="mb-3" style="width: 7px;" /> -->
				<input
					type="email"
					class="form-control sparrow-fs-16 border:{validationErrors?.email && isEmailTouched
						? '3px'
						: '1px'} solid {validationErrors?.email && isEmailTouched
						? 'border-error'
						: 'border-default'}"
					id="exampleInputEmail1"
					aria-describedby="emailHelp"
					placeholder="Please enter your Email ID"
					autocorrect="off"
					autocapitalize="none"
					autocomplete="off"
					bind:value={entryCredentials.email}
					on:blur={async () => {
						isEmailTouched = true;
						validationErrors = await handleEntryValidation(entryCredentials);
					}}
					on:input={async () => {
						validationErrors = await handleEntryValidation(entryCredentials);
					}}
				/>

				{#if validationErrors?.email && isEmailTouched}
					<small class="form-text text-dangerColor"> {validationErrors?.email}</small>
				{/if}
			</div>

			<div class="mb-1">
				<Button
					disable={entryLoader}
					title={'Continue'}
					buttonClassProp={'w-100 py-2 align-items-center d-flex justify-content-center sparrow-fs-16'}
					type={'primary-gradient'}
					loader={entryLoader}
				/>
			</div>
		</form>
		<Oauth />
		<SupportHelp />
	</BgContainer>
{/if}

<style>
	.btn-primary {
		background: var(--primary-color);
	}
	.btn-primary:hover {
		background: var(--primary-btn-color-hover);
	}
	.btn-primary:active {
		background: var(--button-pressed);
	}
	input {
		background-color: transparent !important;
	}
</style>
