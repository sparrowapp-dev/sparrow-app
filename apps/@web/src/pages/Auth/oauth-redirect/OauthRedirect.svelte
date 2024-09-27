<script>
	import { onMount } from 'svelte';
	import { navigate } from 'svelte-navigator';
	import Redirect from '../redirect/Redirect.svelte';
	import constants from '$lib/utils/constants';

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const accessToken = urlParams.get('accessToken');
		const refreshToken = urlParams.get('refreshToken');
		const sparrowRedirect = `sparrow://?accessToken=${accessToken}&refreshToken=${refreshToken}&event=login`;

		if (accessToken && refreshToken) {
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
			}, constants.API_REDIRECT_TIMEOUT);
		}
	});
	let redirectRules = {
		title: 'Welcome to Sparrow!',
		description: 'Bridging Frontend and Backend Development.',
		message: `Easily document and manage APIs for seamless collaboration between frontend and backend teams. Get started now to simplify your development workflows.`,
		isSpinner: true,
		buttonText: 'Open Desktop App',
		buttonClick: () => {},
		loadingMessage: 'Please wait while we sign you in....'
	};
</script>

<Redirect
	title={redirectRules.title}
	description={redirectRules.description}
	message={redirectRules.message}
	isSpinner={redirectRules.isSpinner}
	buttonText={redirectRules.buttonText}
	buttonClick={redirectRules.buttonClick}
	loadingMessage={redirectRules.loadingMessage}
/>
