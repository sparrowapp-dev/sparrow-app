import { writable } from "svelte/store";

const user = writable(null);

const setUser = (data) => {
  user.set(data);
};

export { setUser, user };
