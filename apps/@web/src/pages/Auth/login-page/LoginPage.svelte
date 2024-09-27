<script lang="ts">
	import { Link, navigate } from 'svelte-navigator';
	import { isLoading, isResponseError } from '$lib/store/auth.store';
	import googleLogo from '$lib/assets/googlelogo.svg';
	import eyeHide from '$lib/assets/eye-hide.svg';
	import eyeShow from '$lib/assets/eye-show.svg';
	import { handleLogin, handleLoginValidation } from './login-page';
	import sparrowicon from '$lib/assets/logoSparrowSquare.svg';
	import LoginLoader from '$lib/components/transition/LoginLoader.svelte';
	import Redirect from '../redirect/Redirect.svelte';
	import constants from '$lib/utils/constants';
	import SupportHelp from '$lib/components/help/SupportHelp.svelte';
	import Oauth from '$lib/components/o-auth/Oauth.svelte';
	import starIcon from '$lib/assets/starIcon.svg';
	import { notifications } from '$lib/components/toast-notification/ToastNotification';
	import Button from '$lib/components/button/Button.svelte';
	import BgContainer from '$lib/components/bgContainer/BgContainer.svelte';
	export let id;

	let isEmailTouched = false;
	let isPasswordTouched = false;
	let isLogin = false;
	let authenticationError = false;

	//---------------- Login Validation --------------------//
	let validationErrors: any = {};

	//------------ login Credentials ---------------//
	let loginCredentials = {
		email: id || '',
		password: ''
	};

	let isPasswordVisible = false;

	const togglePasswordVisibility = () => {
		isPasswordVisible = !isPasswordVisible;
		const passwordInput = document.getElementById(
			'exampleInputPassword1'
		) as HTMLInputElement | null;
		if (passwordInput) {
			passwordInput.type = isPasswordVisible ? 'text' : 'password';
		}
	};

	let redirectRules = {
		title: 'Welcome to Sparrow!',
		description: 'Bridging Frontend and Backend Development.',
		message: `Easily document and manage APIs for seamless collaboration between frontend and backend teams. Get started now to simplify your development workflows.`,
		isSpinner: true,
		buttonText: 'Open Desktop App',
		buttonClick: () => {},
		loadingMessage: 'Please wait while we sign you in....'
	};
	let loginLoader = false;
</script>

{#if isLogin}
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
			class="login-form w-100 text-whiteColor ps-1 pe-1 gap-16 mb-2"
			novalidate
			on:submit|preventDefault={async () => {
				isPasswordTouched = true;
				isEmailTouched = true;
				validationErrors = await handleLoginValidation(loginCredentials);
				if (!validationErrors?.email && !validationErrors?.password) {
					loginLoader = true;
					const result = await handleLogin(loginCredentials);
					if (result.isSuccessful) {
						const response = result.data;
						if (response?.isEmailVerified) {
							isLogin = true;
							const accessToken = response?.accessToken?.token;
							const refreshToken = response?.refreshToken?.token;
							const sparrowRedirect = `sparrow://?accessToken=${accessToken}&refreshToken=${refreshToken}&response=${JSON.stringify(response)}&event=login`;
							setTimeout(() => {
								let data = JSON.parse(window.atob(accessToken?.split('.')[1]));
								redirectRules.title = `Welcome back ${data.name}`;
								redirectRules.description = `Redirecting you to desktop app...`;
								redirectRules.message = `If the application does not open automatically,
						please click below.`;
								redirectRules.loadingMessage = '';
								redirectRules.isSpinner = false;
								navigate(sparrowRedirect);
								redirectRules.buttonClick = () => {
									navigate(sparrowRedirect);
								};
							}, 1000);
						} else {
							localStorage.setItem(`timer-verify-${loginCredentials.email}`, new Date().getTime());
							notifications.success('Verification code has been sent to your registered Email ID.');
							navigate(`/verify/email/${loginCredentials.email}`);
						}
					} else {
						const response = result.message;
						if (
							response === 'Could not authenticate. Please try again.' ||
							response === 'password must be longer than or equal to 8 characters'
						) {
							authenticationError = true;
						} else {
							notifications.error(response);
						}
					}
					loginLoader = false;
				}
			}}
		>
			<p class="card-subtitle sparrow-fs-20 sparrow-fw-500 mb-3">Sign In</p>
			<div class="mb-3">
				<label for="exampleInputEmail1" class="form-label text-lightGray sparrow-fs-14 d-flex"
					>Email
					<p class="ms-1 mb-0 sparrow-fw-600 text-dangerColor">*</p>
				</label>
				<!-- <img src={starIcon} alt="" class="mb-3" style="width: 7px;" /> -->
				<input
					type="email"
					class="form-control sparrow-fs-16 border:{(validationErrors?.email && isEmailTouched) ||
					authenticationError
						? '3px'
						: '1px'} solid {(validationErrors?.email && isEmailTouched) || authenticationError
						? 'border-error'
						: 'border-default'}"
					id="exampleInputEmail1"
					aria-describedby="emailHelp"
					placeholder="Please enter your registered Email ID"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="none"
					disabled={id ? true : false}
					bind:value={loginCredentials.email}
					on:blur={async () => {
						isEmailTouched = true;
						validationErrors = await handleLoginValidation(loginCredentials);
					}}
					on:input={async () => {
						validationErrors = await handleLoginValidation(loginCredentials);
						authenticationError = false;
					}}
				/>

				{#if validationErrors?.email && isEmailTouched}
					<small class="form-text text-dangerColor"> {validationErrors?.email}</small>
				{/if}
			</div>

			<div class="mb-4">
				<label for="exampleInputPassword1" class="form-label text-lightGray sparrow-fs-14 d-flex"
					>Password
					<p class="ms-1 mb-0 sparrow-fw-600 text-dangerColor">*</p></label
				>
				<!-- <img src={starIcon} alt="" class="mb-3" style="width: 7px;" /> -->
				<div class="d-flex position-relative">
					<input
						type="password"
						autocomplete="off"
						id="exampleInputPassword1"
						placeholder="Please enter your Password"
						autocorrect="off"
						autocapitalize="none"
						bind:value={loginCredentials.password}
						class="form-control sparrow-fs-16 pe-5 border:{(validationErrors?.password &&
							isPasswordTouched) ||
						authenticationError
							? '3px'
							: '1px'} solid {(validationErrors?.password && isPasswordTouched) ||
						authenticationError
							? 'border-error'
							: 'border-default'}"
						on:blur={async () => {
							isPasswordTouched = true;
							validationErrors = await handleLoginValidation(loginCredentials);
						}}
						on:input={async () => {
							validationErrors = await handleLoginValidation(loginCredentials);
							authenticationError = false;
						}}
					/>
					<button
						type="button"
						on:click={togglePasswordVisibility}
						class="border-0 position-absolute eye-icon d-flex align-items-center"
					>
						{#if isPasswordVisible}
							<img src={eyeShow} alt="eye-show" />
						{:else}
							<img src={eyeHide} alt="eye-hie" />
						{/if}
					</button>
				</div>

				{#if validationErrors?.password && isPasswordTouched}
					<small class="form-text text-dangerColor">{validationErrors?.password}</small>
				{:else if authenticationError}
					<small class="form-text text-dangerColor"
						>The email and password combination you entered appears to be incorrect. Please try
						again.</small
					>
				{/if}
			</div>
			<div class="d-flex mb-4 align-items-center justify-content-end">
				<Link
					to="/forgot/password"
					class="text-decoration-none text-primaryColor sparrow-fs-12 sparrow-fw-500"
					>Forgot Password?</Link
				>
			</div>

			<div class="mb-1">
				<Button
					disable={loginLoader}
					title={'Sign In'}
					buttonClassProp={'w-100 py-2 align-items-center d-flex justify-content-center sparrow-fs-16'}
					type={'primary-gradient'}
					loader={loginLoader}
				/>
			</div>
		</form>
		<Oauth />
		<SupportHelp />
	</BgContainer>
{/if}

<style>
	.eye-icon {
		top: 5px;
		right: 5px;
		background-color: transparent;
	}

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
