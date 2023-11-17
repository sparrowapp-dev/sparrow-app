import { writable } from "svelte/store";

const user = writable(null);
export const username = writable("");
export const isLoading = writable(false);

const setUser = (data) => {
  user.set(data);
};

export { setUser, user };
