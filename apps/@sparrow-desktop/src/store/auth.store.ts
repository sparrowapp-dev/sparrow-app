import { writable } from "svelte/store";

export const user = writable<{ _id: string } | null>(null);
export const isGuestUserActive = writable(false);
export const navigationState = writable("");

export const setUser = (data) => {
  user.set(data);
};
