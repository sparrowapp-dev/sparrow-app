import { writable } from "svelte/store";

const user = writable(null);
export const username = writable("");
export const isLoading = writable(false);
export const isResponseError = writable(false);
export const errorMessageText = writable("");
export const isLoggout = writable(false);
export const register_user = writable(null);
export const userWorkspaceLevelRole = writable(null);

const setUser = (data) => {
  user.set(data);
};

export { setUser, user };
