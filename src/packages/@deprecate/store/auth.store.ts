import { writable } from "svelte/store";

const user = writable<{ _id: string; name: string; email: string } | null>(
  null,
);
export const username = writable("");
export const isLoading = writable(false);
export const isResponseError = writable(false);
export const errorMessageText = writable("");
export const isLoggout = writable(false);
export const register_user = writable(null);
export const userWorkspaceLevelRole = writable(null);
export const isGuestUserActive = writable(false);
export const navigationState = writable("");

const setUser = (data) => {
  user.set(data);
};

export { setUser, user };
